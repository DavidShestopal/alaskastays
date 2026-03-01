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
    { name: 'seo', title: 'SEO' },
  ],

  fields: [
    defineField({
      name: 'title',
      title: 'Experience Title',
      type: 'string',
      description: 'e.g. "Northern Lights Photography Tour"',
      validation: (rule) => rule.required().max(100),
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
      description: 'One-liner shown on cards',
      validation: (rule) => rule.max(120),
      group: 'basic',
    }),

    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
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
        ],
      },
      validation: (rule) => rule.required(),
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
      title: 'Cover Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt Text', type: 'string', validation: (rule) => rule.required() }),
      ],
      validation: (rule) => rule.required(),
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
        ],
      },
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
      name: 'bookingUrl',
      title: 'Booking URL',
      type: 'url',
      description: 'External link to book this experience',
      group: 'booking',
    }),

    defineField({
      name: 'partnerName',
      title: 'Partner / Operator Name',
      type: 'string',
      description: 'Name of the tour operator or guide service',
      group: 'booking',
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
    },
    prepare: ({ title, category, media, status, price }) => ({
      title: title || 'Untitled Experience',
      subtitle: `${category || 'No category'} • ${price ? `$${price}` : 'Free'} • ${status || 'draft'}`,
      media,
    }),
  },
});
