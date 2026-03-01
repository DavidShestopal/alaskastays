export { renderers } from '../../renderers.mjs';

const HOSPITABLE_API_BASE = "https://public.api.hospitable.com/v2";
function getApiKey() {
  const key = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5YTYyNGRmMC0xMmYxLTQ0OGUtYjg4NC00MzY3ODBhNWQzY2QiLCJqdGkiOiJmYzIxZDUyZGE2MjJmZTYyYTI4MDJlYmM4ZDQ0YWYxNDU1YTc2ZjI4MmY4YzUzYjk2MDEwOTFhYWEyMGQxYmI5MjIxNjM4MmU5NWRjOTA3MCIsImlhdCI6MTc3MjMzNjc1NC44NTIxMDgsIm5iZiI6MTc3MjMzNjc1NC44NTIxMTIsImV4cCI6MTgwMzg3Mjc1NC44NDg3OCwic3ViIjoiODc2NzIiLCJzY29wZXMiOlsicGF0OnJlYWQiLCJwYXQ6d3JpdGUiXX0.b9ZD5ad1QhsX0G0Gmh75NTn6YcuBQz4vplgXBsp0oWZpLcoq_jZDstKSA4R7AcKt1yZz9B7RV27xtBGw5WDKQjRNucJ-Mkpleh3LANxDiydyBbs8ShAvHqnIDTSv95CuJlyUOfr-2NK0tmlPdv4kyIot_BE_epE10gAFAYIMsnLjmo6o0GHS35yFOu93E0MiJSxNHGP5qDJVK5O0pKRNGft1AWKgtJT0KEHrRcT8ooXKH1wskTxxEeI87kET8HL9KnB2ZhkpiMzUn3z1WSTW-AYlVgL3TqSKG1xA7k9IgrX9poMxMPzsHM6e5I6oDm0HmmXM4V42JgilJOGD0VL6n3uBBXC8Fb0hUr6qU6BTPk1z3iueDyZBMBNbsLglRA9ygQYuAsU3rmWcfv_MpyTbvoC7TCJ2YwCcH6L3dV0TEwzo8CQklggZv3OprlOPK8ZgkOYh6um1GezFk-bs3S5Em6Pk49dHUHG9bQN4lv12iEw61MEuDbGw23N1BIufBP3ezsnF1z0XNN2JY1kuf5jK-HiyUp1ha8u7FJ0sRPdr-5gpJSh0MgCcahhnLfEifNFfPL527thHfMwlPxD3DGk6WaACt4-EvsdcrOQBeMRXn-Cp8Rk1at9KClSwmef2WV71Giji-e-tOB2bNkk_L35VI6bxNEFHN899IBnqcGt4en0";
  return key;
}
async function hospitableFetch(endpoint, params) {
  const url = new URL(`${HOSPITABLE_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(
      `Hospitable API error: ${response.status} ${response.statusText}`
    );
  }
  return response.json();
}
async function getHospitableProperties() {
  const allProperties = [];
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await hospitableFetch("/properties", { page: String(page) });
    allProperties.push(...response.data);
    hasMore = response.meta.current_page < response.meta.last_page;
    page++;
  }
  return allProperties;
}

const prerender = false;
const GET = async () => {
  try {
    const properties = await getHospitableProperties();
    return new Response(JSON.stringify({ data: properties }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
