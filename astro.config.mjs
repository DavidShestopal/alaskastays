import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sanity({
      projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
      dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
      apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-02-16',
      useCdn: true,
      studioBasePath: '/studio',
    }),
    react(),
  ],
});
