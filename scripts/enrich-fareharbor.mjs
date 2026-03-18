#!/usr/bin/env node

/**
 * FareHarbor Enrichment Script
 *
 * Takes the detail JSON + images JSON from FareHarbor partner API
 * and patches existing Sanity experience documents with rich data:
 *   - highlights, included, notIncluded, whatToBring
 *   - meetingPoint, itinerary, faqs, checkInDetails, accessibility
 *   - minAge, maxAge, groupSize, duration (from structured_description)
 *   - pricePerPerson (from lowest_pricing)
 *   - externalGalleryUrls (from images endpoint)
 *
 * Usage:
 *   node scripts/enrich-fareharbor.mjs <details.json> <images.json>
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
 * Parse newline-separated text into an array of strings,
 * filtering out empty lines and stripping leading bullets/dashes/asterisks.
 */
function splitLines(text) {
  if (!text) return null;
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[\s*•\-–—]+/, '').trim())
    .filter((l) => l.length > 0);
  return lines.length > 0 ? lines : null;
}

/**
 * Parse FAQ markdown into array of { question, answer } objects.
 * FareHarbor uses two formats:
 *   - **Question**\n- Answer (bold markers)
 *   - ##Question\nAnswer (heading markers)
 */
function parseFaqs(text) {
  if (!text) return null;

  const faqs = [];

  // Try ## heading format first: ##Question\nAnswer\n\n##Question\nAnswer
  if (text.includes('##')) {
    const sections = text.split(/(?=##)/);
    for (const section of sections) {
      const match = section.match(/^#{1,3}\s*(.+?)\n([\s\S]*)/);
      if (match) {
        const question = match[1].trim();
        const answer = match[2].replace(/^[\s*•\-–—]+/gm, '').trim();
        if (question && answer) {
          faqs.push({
            _type: 'object',
            _key: `faq-${faqs.length}`,
            question,
            answer,
          });
        }
      }
    }
  }

  // Try **bold** format: **Question**\n- Answer
  if (faqs.length === 0) {
    const blocks = text.split(/\n\n+/);
    for (const block of blocks) {
      const match = block.match(/\*\*(.+?)\*\*\s*\n?[•\-–—]*\s*([\s\S]*)/);
      if (match) {
        const question = match[1].trim();
        const answer = match[2].replace(/^[\s*•\-–—]+/, '').trim();
        if (question && answer) {
          faqs.push({
            _type: 'object',
            _key: `faq-${faqs.length}`,
            question,
            answer,
          });
        }
      }
    }
  }

  return faqs.length > 0 ? faqs : null;
}

/**
 * Parse group size text into { min, max } object.
 * Handles: "28", "Up to 30 people", "Maximum 12 people", "Contact us for groups of 12+"
 */
function parseGroupSize(text) {
  if (!text) return null;

  const justNumber = text.match(/^(\d+)$/);
  if (justNumber) return { min: 1, max: parseInt(justNumber[1]) };

  const upTo = text.match(/(?:up to|maximum|max)\s+(\d+)/i);
  if (upTo) return { min: 1, max: parseInt(upTo[1]) };

  const range = text.match(/(\d+)\s*[-–—to]+\s*(\d+)/);
  if (range) return { min: parseInt(range[1]), max: parseInt(range[2]) };

  return null;
}

/**
 * Clean markdown bold/italic from text for plain-text fields.
 */
function cleanMarkdown(text) {
  if (!text) return null;
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[•\-–—]\s*/gm, '')
    .trim() || null;
}

// ── Build Patch for One Item ──────────────────────────────

function buildPatch(detail, images) {
  const sd = detail.structured_description || {};
  const patch = {};

  // Highlights
  const highlights = splitLines(sd.highlights);
  if (highlights) patch.highlights = highlights;

  // Included
  const included = splitLines(sd.what_is_included);
  if (included) patch.included = included;

  // Not included
  const notIncluded = splitLines(sd.what_is_not_included);
  if (notIncluded) patch.notIncluded = notIncluded;

  // What to bring
  const whatToBring = splitLines(sd.what_to_bring);
  if (whatToBring) patch.whatToBring = whatToBring;

  // Meeting point
  const meeting = cleanMarkdown(sd.meeting_point);
  if (meeting) patch.meetingPoint = meeting;

  // Itinerary
  const itinerary = splitLines(sd.itinerary);
  if (itinerary) patch.itinerary = itinerary;

  // FAQs
  const faqs = parseFaqs(sd.faqs);
  if (faqs) patch.faqs = faqs;

  // Check-in details
  const checkIn = cleanMarkdown(sd.check_in_details);
  if (checkIn) patch.checkInDetails = checkIn;

  // Accessibility
  const access = cleanMarkdown(sd.accessibility);
  if (access) patch.accessibility = access;

  // Min/Max age
  if (sd.min_age != null) patch.minAge = sd.min_age;
  if (sd.max_age != null && sd.max_age < 99) patch.maxAge = sd.max_age;

  // Group size
  const groupSize = parseGroupSize(sd.group_size);
  if (groupSize) patch.groupSize = groupSize;

  // Duration from structured_description (overrides headline-parsed duration)
  if (sd.duration) patch.duration = sd.duration;

  // Price from lowest_pricing (cents → dollars)
  if (detail.lowest_pricing?.lowest_price_cents) {
    patch.pricePerPerson = Math.round(detail.lowest_pricing.lowest_price_cents / 100);
  }

  // Gallery images
  if (images && images.length > 0) {
    patch.externalGalleryUrls = images.map((img) => img.image_url);
    // Set cover image to first gallery image if not already set
    if (!patch.externalImageUrl) {
      patch.externalImageUrl = images[0].image_url;
    }
  }

  return patch;
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  const detailsPath = process.argv[2];
  const imagesPath = process.argv[3];

  if (!detailsPath) {
    console.error('Usage: node scripts/enrich-fareharbor.mjs <details.json> [images.json]');
    process.exit(1);
  }

  const details = JSON.parse(readFileSync(resolve(detailsPath), 'utf-8'));
  const imagesData = imagesPath
    ? JSON.parse(readFileSync(resolve(imagesPath), 'utf-8'))
    : {};

  console.log(`\n📦 Enriching ${details.length} experiences with detail data...\n`);

  let transaction = client.transaction();
  let count = 0;
  let imageCount = 0;

  for (const detail of details) {
    const sanityId = `fareharbor-${detail.id}`;
    const images = imagesData[String(detail.id)] || [];
    const patch = buildPatch(detail, Array.isArray(images) ? images : []);

    const fieldCount = Object.keys(patch).length;
    if (fieldCount === 0) {
      console.log(`  ⏭  ${detail.name} — no new data`);
      continue;
    }

    transaction = transaction.patch(sanityId, (p) => p.set(patch));
    count++;
    const imgLen = Array.isArray(images) ? images.length : 0;
    imageCount += imgLen;
    console.log(`  ✅ ${count}. ${detail.name} — ${fieldCount} fields, ${imgLen} images`);
  }

  if (count === 0) {
    console.log('\n⚠️  No documents to update.');
    return;
  }

  console.log(`\n⏳ Committing ${count} patches (${imageCount} total images) to Sanity...`);

  try {
    const result = await transaction.commit();
    console.log(`\n🎉 Successfully enriched ${count} experiences!`);
    console.log(`   Transaction ID: ${result.transactionId}`);
    console.log(`   Total gallery images added: ${imageCount}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Visit /studio to review enriched data`);
    console.log(`   2. Check detail pages for highlights, FAQs, gallery`);
  } catch (err) {
    console.error('\n❌ Enrichment failed:', err.message);
    if (err.statusCode === 403) {
      console.error('   → Your SANITY_API_TOKEN needs write permissions.');
    }
    process.exit(1);
  }
}

main();
