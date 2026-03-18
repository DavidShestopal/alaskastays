import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { createClient } from '@sanity/client';

// Fetch dynamic slugs from Sanity at build time for sitemap
async function getDynamicPages() {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
  if (!projectId || projectId === 'placeholder') return [];

  try {
    const client = createClient({
      projectId,
      dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-02-16',
      useCdn: true,
    });

    const experienceSlugs = await client.fetch(
      `*[_type == "experience" && status == "active"]{ "slug": slug.current }`
    );

    const urls = [
      'https://alaskastays.com/experiences',
      'https://alaskastays.com/search',
      'https://alaskastays.com/properties/juniper-tree',
      'https://alaskastays.com/properties/valley-view',
      ...experienceSlugs
        .filter((e) => e.slug)
        .map((e) => `https://alaskastays.com/experiences/${e.slug}`),
    ];

    return urls;
  } catch (err) {
    console.warn('Sitemap: Could not fetch Sanity slugs:', err.message);
    return [];
  }
}

const dynamicPages = await getDynamicPages();

export default defineConfig({
  site: 'https://alaskastays.com',
  adapter: vercel(),
  integrations: [tailwind({ applyBaseStyles: false }), sanity({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
    dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
    apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-02-16',
    useCdn: true,
    studioBasePath: '/studio',
  }), react(), sitemap({
    customPages: dynamicPages,
    filter: (page) => !page.includes('/studio') && !page.includes('/404'),
  })],
});