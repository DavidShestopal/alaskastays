#!/usr/bin/env node

/**
 * FareHarbor → Sanity Import Script
 *
 * Usage:
 *   node scripts/import-fareharbor.mjs [path-to-json]
 *
 * If no JSON file path is provided, reads from stdin or uses the
 * embedded sample data. Requires env vars:
 *   - PUBLIC_SANITY_PROJECT_ID
 *   - PUBLIC_SANITY_DATASET
 *   - SANITY_API_TOKEN (with write access)
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
  console.error('❌ PUBLIC_SANITY_PROJECT_ID is not set. Add it to your .env file.');
  process.exit(1);
}
if (!process.env.SANITY_API_TOKEN || process.env.SANITY_API_TOKEN === 'your_read_token') {
  console.error('❌ SANITY_API_TOKEN is not set or still a placeholder. You need a write-access token.');
  process.exit(1);
}

// ── Tag → Category Mapping ───────────────────────────────

const TAG_TO_CATEGORY = {
  'city-tour': 'city-tour',
  'history-tour': 'city-tour',
  'air-activities': 'flightseeing',
  'air-tour': 'flightseeing',
  'dogsled': 'dog-sledding',
  'hiking': 'hiking',
  'walking-tour': 'hiking',
  'photography-tour': 'photography',
  'wildlife': 'wildlife',
  'whale-watch': 'whale-watching',
  'water-activities': 'water',
  'winter-activities': 'winter',
  'climbing': 'climbing',
  'bike-tour': 'biking',
  'atv': 'atv',
  'sightseeing-tour': 'glacier',
  'guidedtour': 'glacier',
  'fitness': 'hiking',
  'lodging': 'elopement',
  'private-tour': null, // modifier, not a category
  'trolley': 'city-tour',
  'airplane': 'flightseeing',
  'fishing': 'fishing',
  'boat-tour': 'fishing',
  'kayak-tour': 'water',
  'bus-tour': 'city-tour',
};

// Priority order: more specific tags win
const CATEGORY_PRIORITY = [
  'fishing', 'dog-sledding', 'whale-watching', 'climbing', 'biking', 'atv',
  'elopement', 'northern-lights', 'flightseeing', 'glacier',
  'wildlife', 'water', 'winter', 'hiking', 'photography',
  'city-tour', 'cultural',
];

function mapCategory(fhTags) {
  if (!fhTags || fhTags.length === 0) return 'glacier'; // fallback

  const mapped = new Set();
  for (const tag of fhTags) {
    const cat = TAG_TO_CATEGORY[tag.shortname];
    if (cat) mapped.add(cat);
  }

  // Return highest-priority match
  for (const cat of CATEGORY_PRIORITY) {
    if (mapped.has(cat)) return cat;
  }

  return 'glacier'; // fallback
}

// ── City → Region Mapping ─────────────────────────────────

const CITY_TO_REGION = {
  'Anchorage': 'anchorage-matsu',
  'Palmer': 'anchorage-matsu',
  'Wasilla': 'anchorage-matsu',
  'Eagle River': 'anchorage-matsu',
  'Seward': 'kenai-peninsula',
  'Homer': 'kenai-peninsula',
  'Kenai': 'kenai-peninsula',
  'Soldotna': 'kenai-peninsula',
  'Whittier': 'prince-william-sound',
  'Valdez': 'prince-william-sound',
  'Cordova': 'prince-william-sound',
  'Talkeetna': 'talkeetna',
  'Denali Park': 'denali',
  'Healy': 'denali',
  'Fairbanks': 'interior',
  'Juneau': 'southeast',
  'Ketchikan': 'southeast',
  'Skagway': 'southeast',
  'Sitka': 'southeast',
  'Kodiak': 'kodiak',
  'Barrow': 'arctic',
  'Utqiagvik': 'arctic',
};

function mapRegion(city) {
  return CITY_TO_REGION[city] || 'anchorage-matsu';
}

// ── Slug Generator ────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

// ── Duration Parser ───────────────────────────────────────

function parseDuration(headline, name) {
  if (!headline) return null;
  // Match patterns like "2.5 to 3-hour", "1 Hour", "1.5 hours", "30 Minutes", "3.5 Hours"
  const hourMatch = headline.match(/(\d+\.?\d*)\s*(?:to\s*(\d+\.?\d*)\s*)?hours?/i);
  const minMatch = headline.match(/(\d+)\s*min(?:utes?|s)?/i);

  if (hourMatch) {
    const low = parseFloat(hourMatch[1]);
    const high = hourMatch[2] ? parseFloat(hourMatch[2]) : null;
    if (high) return `${low}-${high} hours`;
    return low === 1 ? '1 hour' : `${low} hours`;
  }
  if (minMatch) {
    return `${minMatch[1]} minutes`;
  }
  return null;
}

// ── Transform FareHarbor Item → Sanity Document ──────────

function transformItem(item) {
  const slug = slugify(item.name);
  const category = mapCategory(item.tags);
  const region = mapRegion(item.location?.city);
  const duration = parseDuration(item.headline, item.name);
  const tagNames = item.tags?.map((t) => t.name) || [];

  // Determine if this is an elopement/wedding item
  const nameLower = item.name.toLowerCase();
  const isElopement = nameLower.includes('elopement') || nameLower.includes('wedding');
  const finalCategory = isElopement ? 'elopement' : category;

  // Special category overrides based on name
  let overrideCategory = finalCategory;
  if (nameLower.includes('northern lights') || nameLower.includes('aurora')) overrideCategory = 'northern-lights';
  if (nameLower.includes('glacier') && !nameLower.includes('heli') && !nameLower.includes('helicopter')) overrideCategory = 'glacier';
  if (nameLower.includes('paddleboard')) overrideCategory = 'paddleboarding';
  if (nameLower.includes('fishing')) overrideCategory = 'fishing';
  if (nameLower.includes('salmon fishing') || nameLower.includes('salmon species')) overrideCategory = 'fishing';

  return {
    _id: `fareharbor-${item.id}`,
    _type: 'experience',
    title: item.name,
    slug: { _type: 'slug', current: slug },
    tagline: item.headline || null,
    summary: item.summary || null,
    category: overrideCategory,
    tags: tagNames,
    status: 'active',
    featured: (item.quality_score || 0) >= 95,
    externalImageUrl: item.main_image_url || null,
    duration: duration,
    region: region,
    location: item.location ? {
      city: item.location.city || null,
      state: item.location.state || null,
      lat: item.location.coordinates?.y || null,
      lng: item.location.coordinates?.x || null,
    } : null,
    fareHarborShortname: item.company?.shortname || null,
    fareHarborItemId: String(item.id),
    bookingUrl: item.referral_links?.regular_link || null,
    partnerName: item.company?.name || null,
    fareHarbor: {
      itemId: item.id,
      companyId: item.company?.id || null,
      companyName: item.company?.name || null,
      companyShortname: item.company?.shortname || null,
      calendarLink: item.referral_links?.calendar_link || null,
      calendarScript: item.referral_links?.calendar_script || null,
      regularLink: item.referral_links?.regular_link || null,
      qualityScore: item.quality_score || null,
      ratingScore: item.rating_score || null,
      ratingReviewCount: item.rating_review_count || null,
      ratingProvider: item.rating_provider || null,
      availabilityCount: item.availability_count || null,
      imageCount: item.image_count || null,
      lastSynced: new Date().toISOString(),
    },
    seo: {
      metaTitle: item.name.slice(0, 60),
      metaDescription: (item.summary || '').slice(0, 160),
    },
  };
}

// ── Main Import ───────────────────────────────────────────

async function main() {
  // Read JSON input
  let data;
  const jsonPath = process.argv[2];

  if (jsonPath) {
    const raw = readFileSync(resolve(jsonPath), 'utf-8');
    data = JSON.parse(raw);
  } else {
    console.error('Usage: node scripts/import-fareharbor.mjs <path-to-json>');
    console.error('  e.g. node scripts/import-fareharbor.mjs fareharbor-data.json');
    process.exit(1);
  }

  const items = data.results || data;
  if (!Array.isArray(items)) {
    console.error('❌ Expected "results" array in JSON data');
    process.exit(1);
  }

  console.log(`\n📦 Importing ${items.length} FareHarbor experiences to Sanity...\n`);

  // Use transaction for batch create/update
  let transaction = client.transaction();
  let count = 0;

  for (const item of items) {
    const doc = transformItem(item);
    transaction = transaction.createOrReplace(doc);
    count++;
    console.log(`  ✅ ${count}. ${doc.title} → ${doc.category} (${doc.region})`);
  }

  console.log(`\n⏳ Committing ${count} documents to Sanity...`);

  try {
    const result = await transaction.commit();
    console.log(`\n🎉 Successfully imported ${count} experiences!`);
    console.log(`   Transaction ID: ${result.transactionId}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Visit /studio to review imported experiences`);
    console.log(`   2. Mark your top picks as "Featured"`);
    console.log(`   3. Add cover images in Sanity for higher quality (optional)`);
    console.log(`   4. Link experiences to nearby properties via "Nearby Properties" field`);
  } catch (err) {
    console.error('\n❌ Import failed:', err.message);
    if (err.statusCode === 403) {
      console.error('   → Your SANITY_API_TOKEN needs write permissions.');
      console.error('   → Go to sanity.io/manage → API → Tokens → create a token with "Editor" role.');
    }
    process.exit(1);
  }
}

main();
