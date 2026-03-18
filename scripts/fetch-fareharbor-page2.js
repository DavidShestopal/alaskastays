/**
 * FareHarbor Page 2 Fetcher — Browser Console Script
 *
 * Fetches the next 30 items (page 2) from FareHarbor partner API,
 * plus their detail data and images.
 *
 * HOW TO USE:
 * 1. Log into https://partner.fareharbor.com in your browser
 * 2. Open DevTools (F12 or Cmd+Option+I)
 * 3. Paste this entire script into the Console tab
 * 4. Press Enter — it will:
 *    a) Fetch page 2 of the items list
 *    b) Fetch detail data for each item
 *    c) Fetch images for each item
 * 5. Downloads 3 files:
 *    - fareharbor-page2-items.json   → run: node scripts/import-fareharbor.mjs fareharbor-page2-items.json
 *    - fareharbor-page2-details.json → run: node scripts/enrich-fareharbor.mjs fareharbor-page2-details.json fareharbor-page2-images.json
 *    - fareharbor-page2-images.json
 */

(async function fetchFareHarborPage2() {
  const PAGE_URL = 'https://partner-be.fareharbor.com/api/item/?ne_lat=61.628314038943635&ne_lng=-149.072386048999&ordering=-total_quality_score&page=2&page_size=30&radius_km=50&search_location=Palmer&sw_lat=61.57414091662884&sw_lng=-149.16358595179668';
  const DELAY = 500;
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  function download(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`💾 Downloaded ${filename}`);
  }

  // ── Step 1: Fetch page 2 of items list ──────────────────
  console.log('🚀 Step 1: Fetching page 2 items list...');
  let items, nextUrl;
  try {
    const res = await fetch(PAGE_URL, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    items = data.results || data;
    nextUrl = data.next;
    console.log(`✅ Got ${items.length} items from page 2`);
    if (nextUrl) console.log(`📄 Next page URL: ${nextUrl}`);
  } catch (err) {
    console.error('❌ Failed to fetch page 2:', err.message);
    return;
  }

  if (!items || items.length === 0) {
    console.log('⚠️ No items found on page 2.');
    return;
  }

  // Download items list (wrapping in {results:[...]} format for import script compatibility)
  download(items, 'fareharbor-page2-items.json');

  const itemIds = items.map(i => i.id);
  console.log(`\n📋 Item IDs (${itemIds.length}): ${itemIds.join(', ')}`);

  // ── Step 2: Fetch details for each item ─────────────────
  console.log(`\n🚀 Step 2: Fetching details for ${itemIds.length} items...`);
  const details = [];
  const detailErrors = [];

  for (let i = 0; i < itemIds.length; i++) {
    const id = itemIds[i];
    try {
      console.log(`  [${i + 1}/${itemIds.length}] Detail: item ${id}...`);
      const res = await fetch(`https://partner-be.fareharbor.com/api/item/${id}/`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      details.push(data);
      console.log(`  ✅ ${data.name || id}`);
    } catch (err) {
      console.error(`  ❌ Detail ${id}: ${err.message}`);
      detailErrors.push({ id, error: err.message });
    }
    await wait(DELAY);
  }

  console.log(`\n📦 Details: ${details.length}/${itemIds.length} (${detailErrors.length} errors)`);
  download(details, 'fareharbor-page2-details.json');

  // ── Step 3: Fetch images for each item ──────────────────
  console.log(`\n🚀 Step 3: Fetching images for ${itemIds.length} items...`);
  const allImages = {};
  let totalImages = 0;
  const imageErrors = [];

  for (let i = 0; i < itemIds.length; i++) {
    const id = itemIds[i];
    try {
      console.log(`  [${i + 1}/${itemIds.length}] Images: item ${id}...`);
      const res = await fetch(`https://partner-be.fareharbor.com/api/item/${id}/images/`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const images = data.results || data;
      allImages[id] = Array.isArray(images) ? images : [];
      const count = allImages[id].length;
      totalImages += count;
      console.log(`  ✅ ${count} images`);
    } catch (err) {
      console.error(`  ❌ Images ${id}: ${err.message}`);
      imageErrors.push({ id, error: err.message });
      allImages[id] = [];
    }
    await wait(DELAY);
  }

  console.log(`\n📦 Images: ${totalImages} total across ${itemIds.length} items (${imageErrors.length} errors)`);
  download(allImages, 'fareharbor-page2-images.json');

  // ── Summary ─────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('🎉 All done! Downloaded 3 files.');
  console.log('\nImport commands:');
  console.log('  node scripts/import-fareharbor.mjs fareharbor-page2-items.json');
  console.log('  node scripts/enrich-fareharbor.mjs fareharbor-page2-details.json fareharbor-page2-images.json');
  if (nextUrl) {
    console.log(`\n📄 Next page URL (for page 3 script): ${nextUrl}`);
  }
  console.log('='.repeat(50));
})();
