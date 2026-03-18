// =============================================================
// FareHarbor Image Fetcher — paste into browser console
// while logged into partner-be.fareharbor.com
// =============================================================
// Fetches /api/item/{id}/images/ for all 30 items,
// then downloads a single JSON file with all results.

(async () => {
  const ITEM_IDS = [
    491013, 312522, 312525, 66473, 175432, 493235, 66467, 340358,
    569571, 66463, 342238, 569635, 284370, 500840, 681272, 204644,
    204652, 291721, 111672, 111674, 111675, 391155, 543886, 712485,
    283962, 418451, 66474, 502692, 303266, 633796
  ];

  const DELAY_MS = 300; // polite delay between requests
  const results = {};
  let done = 0;

  for (const id of ITEM_IDS) {
    try {
      const res = await fetch(`https://partner-be.fareharbor.com/api/item/${id}/images/`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // data may be an array or { results: [...] }
      const images = Array.isArray(data) ? data : (data.results || data.images || []);
      results[id] = images;
      done++;
      console.log(`✓ ${done}/${ITEM_IDS.length} — item ${id}: ${images.length} images`);
    } catch (err) {
      console.error(`✗ item ${id}: ${err.message}`);
      results[id] = { error: err.message };
      done++;
    }
    // polite delay
    if (done < ITEM_IDS.length) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // Download as JSON
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fareharbor-images.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  console.log(`\n🎉 Done! Downloaded fareharbor-images.json with data for ${Object.keys(results).length} items.`);
})();
