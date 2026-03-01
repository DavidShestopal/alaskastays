import { createClient } from '@sanity/client';

const sanityClient = createClient(
            {"apiVersion":"2024-02-16","projectId":"placeholder","dataset":"production","useCdn":true}
          );

globalThis.sanityClient = sanityClient;
