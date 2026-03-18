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

// ── Experience Queries ─────────────────────────────────────

const experienceFields = `
  title,
  "slug": slug.current,
  tagline,
  summary,
  description,
  category,
  tags,
  status,
  featured,
  coverImage { asset->, alt },
  externalImageUrl,
  gallery[] { asset->, alt, caption },
  externalGalleryUrls,
  duration,
  difficulty,
  groupSize,
  season,
  region,
  location,
  highlights,
  included,
  notIncluded,
  whatToBring,
  meetingPoint,
  itinerary,
  faqs,
  checkInDetails,
  accessibility,
  minAge,
  maxAge,
  pricePerPerson,
  priceNote,
  fareHarborShortname,
  fareHarborItemId,
  bookingUrl,
  partnerName,
  fareHarbor,
  seo,
  relatedProperties[]-> { _id, title, "slug": slug.current }
`;

export async function getExperiences() {
  return safeFetch(
    `*[_type == "experience" && status == "active"] | order(featured desc, title asc) {
      ${experienceFields}
    }`
  );
}

export async function getExperienceBySlug(slug: string) {
  return safeFetch(
    `*[_type == "experience" && slug.current == $slug][0] {
      ${experienceFields}
    }`,
    { slug },
    null
  );
}

export async function getExperiencesForProperty(propertySlug: string) {
  return safeFetch(
    `*[_type == "experience" && status == "active" && references(*[_type == "property" && slug.current == $propertySlug]._id)] | order(featured desc) {
      title,
      "slug": slug.current,
      tagline,
      category,
      duration,
      pricePerPerson,
      priceNote,
      coverImage { asset->, alt },
      fareHarborShortname,
      fareHarborItemId
    }`,
    { propertySlug }
  );
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
