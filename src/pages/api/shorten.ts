import type { APIRoute } from 'astro';
import * as urlService from '../../lib/server/services/url-service';
import { ServiceError } from '../../lib/server/errors';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const { originalUrl, customSlug } = await request.json();
    const { slug } = await urlService.createShortUrl(user.id, originalUrl, customSlug);

    return new Response(JSON.stringify({ slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status });
    }
    console.error('Error in API shorten:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
  }
};

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const userUrls = await urlService.listUserUrls(user.id);
    return new Response(JSON.stringify(userUrls), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener URLs' }), { status: 500 });
  }
};
