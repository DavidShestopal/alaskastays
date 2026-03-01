import type { APIRoute } from 'astro';
import { getHospitableProperties } from '../../lib/hospitable';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const properties = await getHospitableProperties();
    return new Response(JSON.stringify({ data: properties }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
