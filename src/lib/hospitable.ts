import { getPropertyBookingData, type SanityBookingData } from './sanity';

const HOSPITABLE_API_BASE = 'https://public.api.hospitable.com/v2';

function getApiKey(): string {
  const key = import.meta.env.HOSPITABLE_API_KEY;
  if (!key) {
    throw new Error('HOSPITABLE_API_KEY environment variable is not set');
  }
  return key;
}

async function hospitableFetch<T = unknown>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${HOSPITABLE_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Hospitable API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────

export interface HospitableProperty {
  id: string;
  name: string;
  public_name: string;
  picture: string;
  address: {
    number: string | null;
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    country_name: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
    display: string;
  };
  timezone: string;
  listed: boolean;
  currency: string;
  summary: string;
  description: string;
  checkin: string;
  checkout: string;
  amenities: string[];
  capacity: {
    max: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  room_details: Array<{
    type: string;
    beds: Array<{ type: string; quantity: number }>;
  }>;
  property_type: string;
  room_type: string;
  tags: string[];
  house_rules: {
    pets_allowed: boolean;
    smoking_allowed: boolean;
    events_allowed: boolean;
  };
  calendar_restricted: boolean;
  parent_child: unknown;
}

export interface HospitableImage {
  url: string;
  thumbnail_url: string;
  caption: string;
  order: number;
  last_updated_at: string;
}

export interface HospitableReview {
  id: string;
  platform: string;
  public: {
    rating: number;
    rating_platform_original: string;
    review: string;
    response: string | null;
  };
  reviewed_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// ── Helpers ────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatTime(time24: string): string {
  const [hourStr, minute] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute} ${ampm}`;
}

function formatAmenityName(snake: string): string {
  return snake
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const AMENITY_CATEGORIES: Record<string, string[]> = {
  essentials: [
    'wireless_internet', 'heating', 'essentials', 'bed_linens',
    'extra_pillows_and_blankets', 'hangers', 'iron', 'hair_dryer',
    'washer', 'dryer', 'cleaning_products', 'ethernet_connection',
  ],
  kitchen: [
    'kitchen', 'refrigerator', 'freezer', 'microwave', 'oven',
    'stove', 'dishwasher', 'coffee_maker', 'hot_water_kettle',
    'toaster', 'cooking_basics', 'dishes_and_silverware',
    'baking_sheet', 'wine_glasses', 'dining_table',
  ],
  outdoor: [
    'free_parking', 'garden_or_backyard', 'patio', 'patio_or_belcony',
    'outdoor_seating', 'fire_pit', 'bbq_area', 'barbeque_utensils',
    'jacuzzi', 'sauna', 'private_entrance',
  ],
  entertainment: [
    'tv', 'books', 'board_games', 'piano',
    'laptop_friendly_workspace',
  ],
  safety: [
    'smoke_detector', 'carbon_monoxide_detector', 'fire_extinguisher',
    'fireplace_guards',
  ],
  bathroom: [
    'bathtub', 'hot_water', 'body_soap', 'shampoo', 'conditioner',
    'shower_gel',
  ],
  climate: [
    'fireplace', 'ceiling_fan', 'room_darkening_shades',
  ],
};

function categorizeAmenities(
  amenities: string[]
): Array<{ category: string; items: Array<{ name: string }> }> {
  const categorized: Record<string, string[]> = {};
  const used = new Set<string>();

  for (const [category, keywords] of Object.entries(AMENITY_CATEGORIES)) {
    const matched = amenities.filter(
      (a) => keywords.includes(a) && !used.has(a)
    );
    if (matched.length > 0) {
      categorized[category] = matched;
      matched.forEach((a) => used.add(a));
    }
  }

  // Remaining uncategorized amenities
  const remaining = amenities.filter((a) => !used.has(a));
  if (remaining.length > 0) {
    categorized['other'] = remaining;
  }

  return Object.entries(categorized).map(([category, items]) => ({
    category,
    items: items.map((a) => ({ name: formatAmenityName(a) })),
  }));
}

function formatBedType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatRoomType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function transformRooms(
  roomDetails: HospitableProperty['room_details']
): Array<{
  name: string;
  roomType: string;
  description: string | null;
  photos: null;
  beds?: Array<{ type: string; count: number }>;
}> {
  return roomDetails.map((room, i) => {
    const typeName = formatRoomType(room.type);
    const sameTypeCount = roomDetails
      .slice(0, i)
      .filter((r) => r.type === room.type).length;
    const totalOfType = roomDetails.filter(
      (r) => r.type === room.type
    ).length;
    const name =
      totalOfType > 1 ? `${typeName} ${sameTypeCount + 1}` : typeName;

    return {
      name,
      roomType: room.type.includes('bathroom') ? 'bathroom' :
                room.type === 'kitchen' ? 'kitchen' :
                room.type === 'living_room' ? 'living' :
                room.type === 'bedroom' ? 'bedroom' :
                room.type,
      description: null,
      photos: null,
      ...(room.beds.length > 0 && {
        beds: room.beds.map((b) => ({
          type: formatBedType(b.type),
          count: b.quantity,
        })),
      }),
    };
  });
}

function transformHouseRules(
  rules: HospitableProperty['house_rules']
): Array<{ rule: string; details: string }> {
  const result: Array<{ rule: string; details: string }> = [];
  if (!rules.smoking_allowed)
    result.push({ rule: 'no-smoking', details: '' });
  if (!rules.pets_allowed) result.push({ rule: 'no-pets', details: '' });
  if (!rules.events_allowed)
    result.push({ rule: 'no-parties', details: '' });
  return result;
}

// ── Transformed Types (matching template shape) ───────────

export interface BookingInfo {
  widgetCode: string | null;
  directBookingUrl: string | null;
  externalListings: Array<{ platform: string; url: string }> | null;
}

export interface Review {
  rating: number;
  text: string;
  date: string;
  platform: string;
}

export interface ReviewData {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}

export interface PropertyCard {
  hospitableId: string;
  slug: string;
  title: string;
  tagline: string;
  location: string;
  region: string;
  propertyType: string;
  basePrice: number | null;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  rating: number | null;
  totalReviews: number | null;
  badges: string[];
  coverImage: string | null;
  featured: boolean;
  hospitable: BookingInfo | null;
}

export interface PropertyDetail extends PropertyCard {
  description: null;
  descriptionText: string;
  gallery: Array<{ src: string; alt: string }>;
  highlights: null;
  rooms: ReturnType<typeof transformRooms>;
  amenities: ReturnType<typeof categorizeAmenities>;
  houseRules: ReturnType<typeof transformHouseRules>;
  checkInTime: string;
  checkOutTime: string;
  checkInMethod: null;
  cancellationPolicy: null;
  minNights: null;
  cleaningFee: number | null;
  host: null;
  nearbyAttractions: null;
  reviewData: ReviewData | null;
}

// ── Transform Functions ───────────────────────────────────

function toPropertyCard(hp: HospitableProperty): PropertyCard {
  return {
    hospitableId: hp.id,
    slug: slugify(hp.name),
    title: hp.name,
    tagline: hp.public_name,
    location: `${hp.address.city}, ${hp.address.state}`,
    region: hp.address.state,
    propertyType: hp.property_type,
    basePrice: null,
    guests: hp.capacity.max,
    bedrooms: hp.capacity.bedrooms,
    bathrooms: hp.capacity.bathrooms,
    beds: hp.capacity.beds,
    rating: null,
    totalReviews: null,
    badges: [],
    coverImage: hp.picture || null,
    featured: true,
    hospitable: null,
  };
}

interface CalendarDay {
  date: string;
  status: { available: boolean };
  price: { amount: number; currency: string; formatted: string };
}

async function fetchBasePrice(propertyId: string): Promise<number | null> {
  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const response = await hospitableFetch<{ data: { days: CalendarDay[] } }>(
      `/properties/${propertyId}/calendar`,
      { start_date: startDate, end_date: endDate }
    );

    const availablePrices = response.data.days
      .filter((d) => d.status.available && d.price.amount > 0)
      .map((d) => d.price.amount);

    if (availablePrices.length === 0) return null;
    // amount is in cents, convert to dollars
    return Math.round(Math.min(...availablePrices) / 100);
  } catch {
    console.error(`Failed to fetch pricing for property: ${propertyId}`);
    return null;
  }
}

async function fetchPropertyImages(
  propertyId: string
): Promise<HospitableImage[]> {
  try {
    const response = await hospitableFetch<{ data: HospitableImage[] }>(
      `/properties/${propertyId}/images`
    );
    return response.data.sort((a, b) => a.order - b.order);
  } catch {
    console.error(`Failed to fetch images for property: ${propertyId}`);
    return [];
  }
}

function formatReviewDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

async function fetchPropertyReviews(
  propertyId: string
): Promise<ReviewData | null> {
  try {
    // Fetch first page to get total count and initial reviews
    const firstPage = await hospitableFetch<PaginatedResponse<HospitableReview>>(
      `/properties/${propertyId}/reviews`,
      { page: '1' }
    );

    const totalReviews = firstPage.meta.total;
    if (totalReviews === 0) return null;

    // Collect all public reviews across pages for average rating
    // But only keep recent ones for display (limit to 6 displayed)
    let allReviews: HospitableReview[] = [...firstPage.data];
    const totalPages = firstPage.meta.last_page;

    // Fetch remaining pages to compute accurate average
    const pageFetches: Promise<PaginatedResponse<HospitableReview>>[] = [];
    for (let page = 2; page <= totalPages; page++) {
      pageFetches.push(
        hospitableFetch<PaginatedResponse<HospitableReview>>(
          `/properties/${propertyId}/reviews`,
          { page: String(page) }
        )
      );
    }
    const remaining = await Promise.all(pageFetches);
    for (const page of remaining) {
      allReviews.push(...page.data);
    }

    // Calculate average rating from all reviews
    const ratings = allReviews.map((r) => r.public.rating).filter((r) => r > 0);
    const averageRating = ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
      : 0;

    // Transform and return most recent reviews for display
    const reviews: Review[] = allReviews
      .filter((r) => r.public.review && r.public.review.trim().length > 0)
      .sort((a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime())
      .slice(0, 6)
      .map((r) => ({
        rating: r.public.rating,
        text: r.public.review,
        date: formatReviewDate(r.reviewed_at),
        platform: r.platform,
      }));

    return { averageRating, totalReviews, reviews };
  } catch {
    console.error(`Failed to fetch reviews for property: ${propertyId}`);
    return null;
  }
}

async function toPropertyDetail(
  hp: HospitableProperty
): Promise<PropertyDetail> {
  const card = toPropertyCard(hp);
  const parts = [hp.summary, hp.description].filter(Boolean);
  const [images, basePrice, reviewData] = await Promise.all([
    fetchPropertyImages(hp.id),
    fetchBasePrice(hp.id),
    fetchPropertyReviews(hp.id),
  ]);
  const gallery = images.map((img) => ({
    src: img.url,
    alt: img.caption || hp.name,
  }));
  card.basePrice = basePrice;
  if (reviewData) {
    card.rating = reviewData.averageRating;
    card.totalReviews = reviewData.totalReviews;
  }

  return {
    ...card,
    description: null,
    descriptionText: parts.join('\n\n'),
    gallery,
    highlights: null,
    rooms: transformRooms(hp.room_details),
    amenities: categorizeAmenities(hp.amenities),
    houseRules: transformHouseRules(hp.house_rules),
    checkInTime: formatTime(hp.checkin),
    checkOutTime: formatTime(hp.checkout),
    checkInMethod: null,
    cancellationPolicy: null,
    minNights: null,
    cleaningFee: null,
    host: null,
    nearbyAttractions: null,
    reviewData,
  };
}

// ── Raw API Functions ─────────────────────────────────────

async function fetchAllHospitableProperties(): Promise<
  HospitableProperty[]
> {
  const allProperties: HospitableProperty[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await hospitableFetch<
      PaginatedResponse<HospitableProperty>
    >('/properties', { page: String(page) });
    allProperties.push(...response.data);
    hasMore = response.meta.current_page < response.meta.last_page;
    page++;
  }

  return allProperties;
}

// ── Sanity Booking Data Merge ─────────────────────────────

function findBookingData(
  bookingData: SanityBookingData[],
  hospitable_id: string
): BookingInfo | null {
  const match = bookingData.find((d) => d.hospitable_id === hospitable_id);
  if (!match?.hospitable) return null;
  return {
    widgetCode: match.hospitable.widgetCode || null,
    directBookingUrl: match.hospitable.directBookingUrl || null,
    externalListings: match.hospitable.externalListings || null,
  };
}

// ── Public API ────────────────────────────────────────────

async function fetchReviewSummary(
  propertyId: string
): Promise<{ rating: number; total: number } | null> {
  try {
    const response = await hospitableFetch<PaginatedResponse<HospitableReview>>(
      `/properties/${propertyId}/reviews`,
      { page: '1' }
    );
    const total = response.meta.total;
    if (total === 0) return null;
    const ratings = response.data.map((r) => r.public.rating).filter((r) => r > 0);
    if (ratings.length === 0) return null;
    const avg = Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10;
    return { rating: avg, total };
  } catch {
    return null;
  }
}

export async function getAllProperties(): Promise<PropertyCard[]> {
  const [properties, bookingData] = await Promise.all([
    fetchAllHospitableProperties(),
    getPropertyBookingData(),
  ]);
  const listed = properties.filter((p) => p.listed);

  const cards = await Promise.all(
    listed.map(async (hp) => {
      const card = toPropertyCard(hp);
      const [images, basePrice, reviewSummary] = await Promise.all([
        fetchPropertyImages(hp.id),
        fetchBasePrice(hp.id),
        fetchReviewSummary(hp.id),
      ]);
      if (images.length > 0) {
        card.coverImage = images[0].url;
      }
      card.basePrice = basePrice;
      if (reviewSummary) {
        card.rating = reviewSummary.rating;
        card.totalReviews = reviewSummary.total;
      }
      card.hospitable = findBookingData(bookingData, hp.id);
      return card;
    })
  );

  return cards;
}

export async function getFeaturedProperties(): Promise<PropertyCard[]> {
  const [properties, bookingData] = await Promise.all([
    fetchAllHospitableProperties(),
    getPropertyBookingData(),
  ]);
  const listed = properties.filter((p) => p.listed);

  const cards = await Promise.all(
    listed.map(async (hp) => {
      const card = toPropertyCard(hp);
      const [images, basePrice, reviewSummary] = await Promise.all([
        fetchPropertyImages(hp.id),
        fetchBasePrice(hp.id),
        fetchReviewSummary(hp.id),
      ]);
      if (images.length > 0) {
        card.coverImage = images[0].url;
      }
      card.basePrice = basePrice;
      if (reviewSummary) {
        card.rating = reviewSummary.rating;
        card.totalReviews = reviewSummary.total;
      }
      card.hospitable = findBookingData(bookingData, hp.id);
      return card;
    })
  );

  return cards;
}

export async function getPropertyBySlug(
  slug: string
): Promise<PropertyDetail | null> {
  const [properties, bookingData] = await Promise.all([
    fetchAllHospitableProperties(),
    getPropertyBookingData(),
  ]);
  const match = properties.find((p) => slugify(p.name) === slug);
  if (!match) return null;
  const detail = await toPropertyDetail(match);
  detail.hospitable = findBookingData(bookingData, match.id);
  return detail;
}

export async function getAllPropertySlugs(): Promise<
  Array<{ slug: string }>
> {
  const properties = await fetchAllHospitableProperties();
  return properties
    .filter((p) => p.listed)
    .map((p) => ({ slug: slugify(p.name) }));
}

export interface HomepageReview extends Review {
  propertyName: string;
  propertySlug: string;
}

export async function getHomepageReviews(): Promise<HomepageReview[]> {
  try {
    const properties = await fetchAllHospitableProperties();
    const listed = properties.filter((p) => p.listed);

    const allReviews: HomepageReview[] = [];

    await Promise.all(
      listed.map(async (hp) => {
        try {
          // Fetch first 2 pages (20 reviews) per property
          const page1 = await hospitableFetch<PaginatedResponse<HospitableReview>>(
            `/properties/${hp.id}/reviews`,
            { page: '1' }
          );
          let reviews = [...page1.data];
          if (page1.meta.last_page >= 2) {
            const page2 = await hospitableFetch<PaginatedResponse<HospitableReview>>(
              `/properties/${hp.id}/reviews`,
              { page: '2' }
            );
            reviews.push(...page2.data);
          }

          const transformed = reviews
            .filter((r) => r.public.review && r.public.review.trim().length > 40 && r.public.rating >= 4)
            .map((r) => ({
              rating: r.public.rating,
              text: r.public.review,
              date: formatReviewDate(r.reviewed_at),
              platform: r.platform,
              propertyName: hp.name,
              propertySlug: slugify(hp.name),
            }));
          allReviews.push(...transformed);
        } catch {
          // skip property on error
        }
      })
    );

    // Sort by date descending, interleave properties, return top 12
    allReviews.sort(() => Math.random() - 0.5);
    // Ensure mix of properties
    const byProperty = new Map<string, HomepageReview[]>();
    for (const r of allReviews) {
      const arr = byProperty.get(r.propertySlug) || [];
      arr.push(r);
      byProperty.set(r.propertySlug, arr);
    }
    const interleaved: HomepageReview[] = [];
    let hasMore = true;
    let idx = 0;
    const propertyArrays = [...byProperty.values()];
    while (hasMore && interleaved.length < 12) {
      hasMore = false;
      for (const arr of propertyArrays) {
        if (idx < arr.length) {
          interleaved.push(arr[idx]);
          hasMore = true;
        }
      }
      idx++;
    }
    return interleaved.slice(0, 12);
  } catch {
    console.error('Failed to fetch homepage reviews');
    return [];
  }
}

export async function getHospitableCalendar(
  propertyId: string,
  startDate: string,
  endDate: string
) {
  return hospitableFetch(`/properties/${propertyId}/calendar`, {
    start_date: startDate,
    end_date: endDate,
  });
}
