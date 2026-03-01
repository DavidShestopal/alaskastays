import { createImageUrlBuilder } from '@sanity/image-url';

const builder = createImageUrlBuilder({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
});

export function urlFor(source: any) {
  return builder.image(source);
}
