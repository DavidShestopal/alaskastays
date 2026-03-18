/**
 * Optimize Filestack CDN image URLs with resize, compress, and WebP conversion.
 * Also handles Hospitable and generic URLs passthrough.
 */
export function optimizeImage(url: string | null | undefined, width = 800): string {
  if (!url) return '';

  // Filestack CDN — insert transforms before the file hash
  if (url.includes('cdn.filestackcontent.com')) {
    const parts = url.split('cdn.filestackcontent.com/');
    if (parts.length === 2) {
      const hash = parts[1];
      // Skip if already has transforms
      if (hash.includes('/resize=') || hash.includes('/compress')) return url;
      return `https://cdn.filestackcontent.com/resize=width:${width},fit:max/compress/output=format:webp/${hash}`;
    }
  }

  // Hospitable CDN — no transform API available, return as-is
  // Sanity CDN — already optimized via @sanity/image-url
  return url;
}
