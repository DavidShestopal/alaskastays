/**
 * JSON-LD Schema generators for Alaska Stays
 */

const SITE_URL = 'https://alaskastays.com';
const SITE_NAME = 'Alaska Stays';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/alaskastayslogo.svg`,
    description: "Handpicked wilderness retreats across Alaska's most breathtaking landscapes. Book direct for the best experience.",
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Palmer',
      addressRegion: 'AK',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 61.6,
      longitude: -149.1,
    },
    sameAs: [
      'https://www.instagram.com/alaska_stays/',
      'https://www.facebook.com/people/Juniper-Tree-Guest-House/100089645768293/',
      'https://www.youtube.com/channel/UCm-7doEXjAI8jkWUhBaFLzw',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function lodgingSchema(property: {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
  location?: { city?: string; state?: string };
  pricePerNight?: number;
  propertyType?: string;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
}) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.title,
    url: `${SITE_URL}/properties/${property.slug}`,
    description: property.description || '',
  };

  if (property.coverImage) {
    schema.image = property.coverImage;
  }

  if (property.location?.city) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: property.location.city,
      addressRegion: property.location.state || 'AK',
      addressCountry: 'US',
    };
  }

  if (property.rating && property.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: property.rating,
      reviewCount: property.reviewCount,
      bestRating: 5,
    };
  }

  if (property.pricePerNight) {
    schema.priceRange = `$${property.pricePerNight}+`;
  }

  if (property.guests) schema.numberOfRooms = property.bedrooms || 1;

  return schema;
}

export function experienceSchema(experience: {
  title: string;
  slug: string;
  tagline?: string;
  summary?: string;
  coverImage?: string;
  duration?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  partnerName?: string;
  location?: { city?: string };
  bookingUrl?: string;
}) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: experience.title,
    url: `${SITE_URL}/experiences/${experience.slug}`,
    description: experience.summary || experience.tagline || '',
    touristType: experience.category || 'Adventure',
  };

  if (experience.coverImage) {
    schema.image = experience.coverImage;
  }

  if (experience.location?.city) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: experience.location.city,
      addressRegion: 'AK',
      addressCountry: 'US',
    };
  }

  if (experience.rating && experience.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: experience.rating,
      reviewCount: experience.reviewCount,
      bestRating: 5,
    };
  }

  if (experience.partnerName) {
    schema.provider = {
      '@type': 'Organization',
      name: experience.partnerName,
    };
  }

  return schema;
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
