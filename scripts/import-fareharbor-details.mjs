#!/usr/bin/env node

/**
 * FareHarbor Detail Enrichment Script
 *
 * Takes the JSON downloaded from the browser console script
 * and enriches existing Sanity experience documents with:
 * - highlights, included, notIncluded, whatToBring
 * - pricePerPerson (from lowest_pricing.lowest_price_cents)
 * - duration (from structured_description)
 * - groupSize (from structured_description)
 * - meetingPoint, itinerary, checkInDetails
 * - faqs (parsed from markdown-style Q&A string)
 * - accessibility, minAge, maxAge
 *
 * Usage:
 *   node scripts/import-fareharbor-details.mjs <path-to-details-json>
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import 'dotenv/config';

// ── Sanity Client ─────────────────────────────────────────

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-02-16',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

if (!process.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID === 'placeholder') {
  console.error('❌ PUBLIC_SANITY_PROJECT_ID is not set.');
  process.exit(1);
}
if (!process.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN === 'your_read_token') {
  console.error('❌ SANITY_API_TOKEN is not set or still a placeholder.');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────

/**
 * Split a newline-separated string into a clean array of items.
 * Strips markdown bold/italic markers and empty lines.
 */
function splitLines(str) {
  if (!str || typeof str !== 'string') return null;
  const items = str
    .split('\n')
    .map((line) => line.replace(/^\s*[-•·*]+\s*/, '').trim()) // strip leading bullets
    .map((line) => line.replace(/\*{1,3}/g, '').trim()) // strip markdown bold/italic
    .filter((line) => line.length > 0 && line !== '&' && !line.startsWith('---'));
  return items.length > 0 ? items : null;
}

/**
 * Split a what_to_bring string that uses double-newlines + markdown formatting.
 * e.g. "*Light Winter Jacket*\n– description\n\n*Comfortable Footwear*\n– description"
 */
function splitWhatToBring(str) {
  if (!str || typeof str !== 'string') return null;

  // Split by double newlines first (paragraph blocks)
  const blocks = str.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  if (blocks.length > 1) {
    // Each block is an item — take the first line of each as the item name
    return blocks
      .map((block) => {
        // Get first line, strip markdown
        const firstLine = block.split('\n')[0].replace(/\*{1,3}/g, '').replace(/^\s*[-•·]+\s*/, '').trim();
        return firstLine;
      })
      .filter((item) => item.length > 0 && item !== ':-)')  ;
  }

  // Fallback: split by newlines
  return splitLines(str);
}

/**
 * Parse FAQ string in markdown format:
 * "**Question text?**\n- Answer text\n\n**Another question?**\n- Another answer"
 */
function parseFaqString(str) {
  if (!str || typeof str !== 'string') return null;

  const faqs = [];
  // Split by double newlines to get Q&A blocks
  const blocks = str.split(/\n\n+/).filter((b) => b.trim().length > 0);

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // First line is the question (may have ** markers)
    let question = lines[0].replace(/\*{1,3}/g, '').trim();
    // Remove leading "Q:" or numbering
    question = question.replace(/^Q:\s*/i, '').replace(/^\d+\.\s*/, '').trim();

    // Remaining lines form the answer
    const answerLines = lines.slice(1).map((l) =>
      l.replace(/^\s*[-•·]+\s*/, '').replace(/\*{1,3}/g, '').trim()
    );
    const answer = answerLines.join(' ').trim();

    if (question && answer) {
      faqs.push({
        _type: 'object',
        _key: `faq-${Math.random().toString(36).slice(2, 8)}`,
        question,
        answer,
      });
    }
  }

  return faqs.length > 0 ? faqs : null;
}

/**
 * Parse group_size string into { min, max } object.
 */
function parseGroupSize(gs) {
  if (!gs) return null;
  if (typeof gs === 'number') return { min: 1, max: gs };
  if (typeof gs !== 'string') return null;

  const rangeMatch = gs.match(/(\d+)\s*[-–to]+\s*(\d+)/);
  if (rangeMatch) return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };

  const upToMatch = gs.match(/up\s*to\s*(\d+)/i);
  if (upToMatch) return { min: 1, max: parseInt(upToMatch[1]) };

  const singleMatch = gs.match(/(\d+)/);
  if (singleMatch) return { min: 1, max: parseInt(singleMatch[1]) };

  return null;
}

/**
 * Extract price from lowest_pricing object.
 * FareHarbor uses lowest_price_cents (price in cents).
 */
function extractPrice(item) {
  if (item.lowest_pricing?.lowest_price_cents) {
    return Math.round(item.lowest_pricing.lowest_price_cents / 100);
  }
  if (item.lowest_pricing?.amount) {
    return Math.round(item.lowest_pricing.amount / 100);
  }
  return null;
}

// ── Build Sanity Patch ────────────────────────────────────

function buildPatch(item) {
  const sd = item.structured_description || {};
  const patch = {};

  // Highlights
  const highlights = splitLines(sd.highlights);
  if (highlights) patch.highlights = highlights;

  // What's included
  const included = splitLines(sd.what_is_included);
  if (included) patch.included = included;

  // What's not included
  const notIncluded = splitLines(sd.what_is_not_included);
  if (notIncluded) patch.notIncluded = notIncluded;

  // What to bring
  const whatToBring = splitWhatToBring(sd.what_to_bring);
  if (whatToBring) patch.whatToBring = whatToBring;

  // Meeting point
  if (sd.meeting_point && typeof sd.meeting_point === 'string' && sd.meeting_point.trim()) {
    patch.meetingPoint = sd.meeting_point.trim();
  }

  // Itinerary
  const itinerary = splitLines(sd.itinerary);
  if (itinerary) patch.itinerary = itinerary;

  // Check-in details — strip markdown formatting for clean display
  if (sd.check_in_details && typeof sd.check_in_details === 'string' && sd.check_in_details.trim()) {
    patch.checkInDetails = sd.check_in_details
      .replace(/\*{1,3}/g, '')
      .replace(/^#+\s*/gm, '')
      .trim();
  }

  // Accessibility
  if (sd.accessibility && typeof sd.accessibility === 'string' && sd.accessibility.trim()) {
    patch.accessibility = sd.accessibility.trim();
  }

  // FAQs — parse from markdown string
  const faqs = parseFaqString(sd.faqs);
  if (faqs) patch.faqs = faqs;

  // Group size
  const groupSize = parseGroupSize(sd.group_size);
  if (groupSize) patch.groupSize = groupSize;

  // Duration
  if (sd.duration && typeof sd.duration === 'string' && sd.duration.trim()) {
    patch.duration = sd.duration.trim();
  }

  // Price (from lowest_pricing cents)
  const price = extractPrice(item);
  if (price && price > 0) patch.pricePerPerson = price;

  // Min/Max age — on the structured_description object
  if (sd.min_age != null && sd.min_age !== '') patch.minAge = Number(sd.min_age);
  if (sd.max_age != null && sd.max_age !== '') patch.maxAge = Number(sd.max_age);

  // Price note from structured_description pricing
  if (sd.pricing && typeof sd.pricing === 'string' && sd.pricing.trim()) {
    patch.priceNote = sd.pricing.trim();
  }

  return patch;
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node scripts/import-fareharbor-details.mjs <path-to-details-json>');
    console.error('  e.g. node scripts/import-fareharbor-details.mjs ~/Downloads/fareharbor-details.json');
    process.exit(1);
  }

  const raw = readFileSync(resolve(jsonPath), 'utf-8');
  const items = JSON.parse(raw);

  if (!Array.isArray(items)) {
    console.error('❌ Expected a JSON array of item detail objects');
    process.exit(1);
  }

  console.log(`\n📦 Enriching ${items.length} FareHarbor experiences in Sanity...\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of items) {
    const itemId = item.id || item.pk;
    if (!itemId) {
      console.warn('  ⚠️  Skipping item with no ID');
      skipped++;
      continue;
    }

    const sanityId = `fareharbor-${itemId}`;
    const patch = buildPatch(item);
    const fieldCount = Object.keys(patch).length;

    if (fieldCount === 0) {
      console.log(`  ⏭️  ${item.name || itemId}: No enrichment data found`);
      skipped++;
      continue;
    }

    try {
      await client
        .patch(sanityId)
        .set(patch)
        .commit();

      const fields = Object.keys(patch).join(', ');
      console.log(`  ✅ ${item.name || itemId}: ${fieldCount} fields (${fields})`);
      updated++;
    } catch (err) {
      if (err.statusCode === 404) {
        console.warn(`  ⚠️  ${item.name || itemId}: Document ${sanityId} not found in Sanity — skipping`);
        skipped++;
      } else {
        console.error(`  ❌ ${item.name || itemId}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n🎉 Enrichment complete!`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  if (updated > 0) {
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Visit /studio to review enriched experiences`);
    console.log(`   2. Check highlights, included items, and FAQs`);
    console.log(`   3. Add any missing details manually`);
  }
}

main();
