/**
 * FareHarbor Detail Fetcher — Browser Console Script
 *
 * HOW TO USE:
 * 1. Log into https://partner.fareharbor.com in your browser
 * 2. Open DevTools (F12 or Cmd+Option+I)
 * 3. Paste this entire script into the Console tab
 * 4. Press Enter — it will fetch all 30 items with a delay between each
 * 5. When done, it auto-downloads "fareharbor-details.json"
 */

(async function fetchAllFareHarborDetails() {
  const ITEM_IDS = [
    491013, 312522, 312525, 66473, 175432, 493235, 66467, 340358,
    569571, 66463, 342238, 569635, 284370, 500840, 681272, 204644,
    204652, 291721, 111672, 111674, 111675, 391155, 543886, 712485,
    283962, 418451, 66474, 502692, 303266, 633796
  ];

  const results = [];
  const errors = [];

  console.log(`🚀 Fetching details for ${ITEM_IDS.length} FareHarbor items...`);

  for (let i = 0; i < ITEM_IDS.length; i++) {
    const id = ITEM_IDS[i];
    try {
      console.log(`  [${i + 1}/${ITEM_IDS.length}] Fetching item ${id}...`);
      const res = await fetch(`https://partner-be.fareharbor.com/api/item/${id}/`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      results.push(data);
      console.log(`  ✅ ${data.name || id}`);
    } catch (err) {
      console.error(`  ❌ Item ${id}: ${err.message}`);
      errors.push({ id, error: err.message });
    }

    // 500ms delay between requests to be polite
    if (i < ITEM_IDS.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n📦 Fetched ${results.length}/${ITEM_IDS.length} items (${errors.length} errors)`);

  if (errors.length > 0) {
    console.table(errors);
  }

  // Download as JSON
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fareharbor-details.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('💾 Downloaded fareharbor-details.json');
  return results;
})();
