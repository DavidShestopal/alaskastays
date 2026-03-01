import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Property Name',
      type: 'string',
      description: 'Display label for reference (synced from Hospitable)',
    }),
    defineField({
      name: 'hospitable_id',
      title: 'Hospitable Property ID',
      type: 'string',
      description: 'The UUID from Hospitable API (e.g. 7ab9bf7b-ec07-472a-b97c-6acd9766cce8)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hospitable',
      title: 'Hospitable / Booking Integration',
      type: 'object',
      fields: [
        defineField({
          name: 'widgetCode',
          title: 'Hospitable Widget Code',
          type: 'text',
          rows: 6,
          description: 'Paste the Hospitable booking widget embed code here',
        }),
        defineField({
          name: 'directBookingUrl',
          title: 'Direct Booking URL',
          type: 'url',
          description: 'Fallback direct booking link',
        }),
        defineField({
          name: 'externalListings',
          title: 'External Listing Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                defineField({
                  name: 'platform',
                  title: 'Platform',
                  type: 'string',
                  options: {
                    list: ['Airbnb', 'VRBO', 'Booking.com', 'Hipcamp', 'Houfy', 'Other'],
                  },
                }),
                defineField({ name: 'url', title: 'Listing URL', type: 'url' }),
              ],
              preview: {
                select: { platform: 'platform', url: 'url' },
                prepare: ({ platform, url }) => ({ title: platform, subtitle: url }),
              },
            },
          ],
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      hospitable_id: 'hospitable_id',
    },
    prepare: ({ title, hospitable_id }) => ({
      title: title || 'Untitled Property',
      subtitle: hospitable_id || 'No Hospitable ID',
    }),
  },
});
