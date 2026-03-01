import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: import.meta.env.PUBLIC_SANITY_API_VERSION || '2024-02-16',
  useCdn: true,
});

/**
 * Safe wrapper around GROQ queries — returns fallback on error
 * so the site can build even without a configured Sanity project.
 */
export async function safeFetch<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
  fallback: T = [] as unknown as T
): Promise<T> {
  try {
    const result = await client.fetch<T>(query, params ?? {});
    return result ?? fallback;
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return fallback;
  }
}

// ── Booking Data Query ──────────────────────────────────────

export interface SanityBookingData {
  hospitable_id: string;
  hospitable: {
    widgetCode: string | null;
    directBookingUrl: string | null;
    externalListings: Array<{ platform: string; url: string }> | null;
  } | null;
}

export async function getPropertyBookingData(): Promise<SanityBookingData[]> {
  return safeFetch<SanityBookingData[]>(
    `*[_type == "property" && defined(hospitable_id)] {
      hospitable_id,
      hospitable {
        widgetCode,
        directBookingUrl,
        externalListings[] { platform, url }
      }
    }`
  );
}
