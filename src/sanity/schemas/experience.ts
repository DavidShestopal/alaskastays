import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'media', title: 'Photos & Media' },
    { name: 'details', title: 'Details' },
    { name: 'booking', title: 'Booking & Pricing' },
    { name: 'fareharbor', title: 'FareHarbor Data' },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Experience Title',
      type: 'string',
      description: 'e.g. "Northern Lights Photography Tour"',
      validation: (rule) => rule.required().max(120),
      group: 'basic',
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
      group: 'basic',
    }),

    defineField({
      name: 'tagline',
      title: 'Short Tagline',
      type: 'string',
      description: 'One-liner shown on cards (from FareHarbor headline)',
      validation: (rule) => rule.max(200),
      group: 'basic',
    }),

    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 4,
      description: 'Plain text summary shown on cards and in previews',
      group: 'basic',
    }),

    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text description for the detail page (optional — summary used as fallback)',
      group: 'basic',
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Northern Lights', value: 'northern-lights' },
          { title: 'Glacier Tours', value: 'glacier' },
          { title: 'Fishing', value: 'fishing' },
          { title: 'Wildlife', value: 'wildlife' },
          { title: 'Dog Sledding', value: 'dog-sledding' },
          { title: 'Hiking & Trekking', value: 'hiking' },
          { title: 'Kayaking & Rafting', value: 'water' },
          { title: 'Flightseeing', value: 'flightseeing' },
          { title: 'Hot Springs', value: 'hot-springs' },
          { title: 'Cultural', value: 'cultural' },
          { title: 'Winter Sports', value: 'winter' },
          { title: 'Photography', value: 'photography' },
          { title: 'Bear Viewing', value: 'bear-viewing' },
          { title: 'Whale Watching', value: 'whale-watching' },
          { title: 'City Tour', value: 'city-tour' },
          { title: 'ATV & Off-Road', value: 'atv' },
          { title: 'Biking', value: 'biking' },
          { title: 'Climbing', value: 'climbing' },
          { title: 'Paddleboarding', value: 'paddleboarding' },
          { title: 'Elopement & Wedding', value: 'elopement' },
        ],
      },
      validation: (rule) => rule.required(),
      group: 'basic',
    }),

    defineField({
      name: 'tags',
      title: 'Activity Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Tags from FareHarbor (e.g. "Air Tour", "Wildlife", "Dogsled")',
      options: { layout: 'tags' },
      group: 'basic',
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active', value: 'active' },
          { title: 'Draft', value: 'draft' },
          { title: 'Seasonal - Closed', value: 'seasonal-closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      group: 'basic',
    }),

    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      group: 'basic',
    }),

    // Media
    defineField({
      name: 'coverImage',
      title: 'Cover Photo (Sanity)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
      ],
      description: 'Upload a cover photo here, or use the external image URL below',
      group: 'media',
    }),

    defineField({
      name: 'externalImageUrl',
      title: 'External Image URL',
      type: 'url',
      description: 'FareHarbor CDN image URL — used when no Sanity cover image is uploaded',
      group: 'media',
    }),

    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alt Text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
      options: { layout: 'grid' },
      group: 'media',
    }),

    defineField({
      name: 'externalGalleryUrls',
      title: 'External Gallery URLs',
      type: 'array',
      of: [{ type: 'url' }],
      description: 'FareHarbor CDN image URLs for the gallery — used when no Sanity gallery images are uploaded',
      group: 'media',
    }),

    // Details
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g. "3 hours", "Full day", "2 days"',
      group: 'details',
    }),

    defineField({
      name: 'difficulty',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Easy - All ages', value: 'easy' },
          { title: 'Moderate - Some fitness required', value: 'moderate' },
          { title: 'Challenging - Good fitness required', value: 'challenging' },
          { title: 'Expert - Prior experience needed', value: 'expert' },
        ],
      },
      group: 'details',
    }),

    defineField({
      name: 'groupSize',
      title: 'Group Size',
      type: 'object',
      fields: [
        defineField({ name: 'min', title: 'Minimum', type: 'number' }),
        defineField({ name: 'max', title: 'Maximum', type: 'number' }),
      ],
      group: 'details',
    }),

    defineField({
      name: 'season',
      title: 'Available Seasons',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Spring (Mar-May)', value: 'spring' },
          { title: 'Summer (Jun-Aug)', value: 'summer' },
          { title: 'Fall (Sep-Nov)', value: 'fall' },
          { title: 'Winter (Dec-Feb)', value: 'winter' },
          { title: 'Year-round', value: 'year-round' },
        ],
      },
      group: 'details',
    }),

    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: [
          { title: 'Kenai Peninsula', value: 'kenai-peninsula' },
          { title: 'Denali Region', value: 'denali' },
          { title: 'Southeast Alaska', value: 'southeast' },
          { title: 'Interior Alaska', value: 'interior' },
          { title: 'Anchorage & Mat-Su', value: 'anchorage-matsu' },
          { title: 'Prince William Sound', value: 'prince-william-sound' },
          { title: 'Kodiak Island', value: 'kodiak' },
          { title: 'Arctic & Far North', value: 'arctic' },
          { title: 'Talkeetna', value: 'talkeetna' },
        ],
      },
      group: 'details',
    }),

    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'lat', title: 'Latitude', type: 'number' }),
        defineField({ name: 'lng', title: 'Longitude', type: 'number' }),
      ],
      group: 'details',
    }),

    defineField({
      name: 'highlights',
      title: 'Experience Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet points of what makes this special',
      group: 'details',
    }),

    defineField({
      name: 'included',
      title: "What's Included",
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "Professional guide", "All gear provided", "Lunch"',
      group: 'details',
    }),

    defineField({
      name: 'notIncluded',
      title: "What's Not Included",
      type: 'array',
      of: [{ type: 'string' }],
      group: 'details',
    }),

    defineField({
      name: 'whatToBring',
      title: 'What to Bring',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'details',
    }),

    defineField({
      name: 'meetingPoint',
      title: 'Meeting Point',
      type: 'text',
      rows: 3,
      description: 'Where to meet for this experience',
      group: 'details',
    }),

    defineField({
      name: 'itinerary',
      title: 'Itinerary',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Step-by-step itinerary of the experience',
      group: 'details',
    }),

    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
      group: 'details',
    }),

    defineField({
      name: 'checkInDetails',
      title: 'Check-in Details',
      type: 'text',
      rows: 3,
      description: 'Check-in instructions and arrival information',
      group: 'details',
    }),

    defineField({
      name: 'accessibility',
      title: 'Accessibility Notes',
      type: 'text',
      rows: 3,
      description: 'Accessibility information and requirements',
      group: 'details',
    }),

    defineField({
      name: 'minAge',
      title: 'Minimum Age',
      type: 'number',
      description: 'Minimum age requirement (if any)',
      group: 'details',
    }),

    defineField({
      name: 'maxAge',
      title: 'Maximum Age',
      type: 'number',
      description: 'Maximum age limit (if any)',
      group: 'details',
    }),

    defineField({
      name: 'relatedProperties',
      title: 'Nearby Properties',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'property' }] }],
      description: 'Properties close to where this experience takes place',
      group: 'details',
    }),

    // Booking & Pricing
    defineField({
      name: 'pricePerPerson',
      title: 'Price Per Person ($)',
      type: 'number',
      group: 'booking',
    }),

    defineField({
      name: 'priceNote',
      title: 'Price Note',
      type: 'string',
      description: 'e.g. "per person", "per group up to 6", "free for guests"',
      group: 'booking',
    }),

    defineField({
      name: 'fareHarborShortname',
      title: 'FareHarbor Shortname',
      type: 'string',
      description: 'The operator\'s FareHarbor shortname (e.g. "anchoragetrolley")',
      group: 'booking',
    }),

    defineField({
      name: 'fareHarborItemId',
      title: 'FareHarbor Item ID',
      type: 'string',
      description: 'Specific tour/activity item ID for Lightframe embed',
      group: 'booking',
    }),

    defineField({
      name: 'bookingUrl',
      title: 'Booking URL (Fallback)',
      type: 'url',
      description: 'External link to book — used when FareHarbor fields are empty',
      group: 'booking',
    }),

    defineField({
      name: 'partnerName',
      title: 'Partner / Operator Name',
      type: 'string',
      description: 'Name of the tour operator or guide service',
      group: 'booking',
    }),

    // FareHarbor Data — auto-populated from API import
    defineField({
      name: 'fareHarbor',
      title: 'FareHarbor Data',
      type: 'object',
      description: 'Auto-populated from FareHarbor affiliate API. Do not edit manually.',
      group: 'fareharbor',
      fields: [
        defineField({ name: 'itemId', title: 'Item ID', type: 'number', readOnly: true }),
        defineField({ name: 'companyId', title: 'Company ID', type: 'number', readOnly: true }),
        defineField({ name: 'companyName', title: 'Company Name', type: 'string', readOnly: true }),
        defineField({ name: 'companyShortname', title: 'Company Shortname', type: 'string', readOnly: true }),
        defineField({ name: 'calendarLink', title: 'Calendar Embed Link', type: 'url', readOnly: true }),
        defineField({ name: 'calendarScript', title: 'Calendar Embed Script', type: 'text', rows: 2, readOnly: true }),
        defineField({ name: 'regularLink', title: 'Regular Booking Link', type: 'url', readOnly: true }),
        defineField({ name: 'qualityScore', title: 'Quality Score', type: 'number', readOnly: true }),
        defineField({ name: 'ratingScore', title: 'Rating Score', type: 'number', readOnly: true }),
        defineField({ name: 'ratingReviewCount', title: 'Review Count', type: 'number', readOnly: true }),
        defineField({ name: 'ratingProvider', title: 'Rating Provider', type: 'string', readOnly: true }),
        defineField({ name: 'availabilityCount', title: 'Availability Count', type: 'number', readOnly: true }),
        defineField({ name: 'imageCount', title: 'Image Count', type: 'number', readOnly: true }),
        defineField({ name: 'lastSynced', title: 'Last Synced', type: 'datetime', readOnly: true }),
      ],
    }),

    // SEO
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', validation: (rule) => rule.max(60) }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 3, validation: (rule) => rule.max(160) }),
      ],
      group: 'seo',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'coverImage',
      status: 'status',
      price: 'pricePerPerson',
      rating: 'fareHarbor.ratingScore',
      reviews: 'fareHarbor.ratingReviewCount',
    },
    prepare: ({ title, category, media, status, price, rating, reviews }) => {
      const ratingStr = rating ? `★${rating}(${reviews || 0})` : '';
      return {
        title: title || 'Untitled Experience',
        subtitle: `${category || 'No category'} • ${price ? `$${price}` : 'See pricing'} • ${status || 'draft'} ${ratingStr}`,
        media,
      };
    },
  },
});
