import type { APIRoute } from 'astro';
import * as urlService from '../../../lib/server/services/url-service';
import { ServiceError } from '../../../lib/server/errors';

// DELETE /api/shorten/[id] - Delete a short link owned by the authenticated user
export const DELETE: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  const { id } = params;

  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }
  if (!id) {
    return new Response(JSON.stringify({ error: 'Falta el identificador del enlace' }), { status: 400 });
  }

  try {
    await urlService.deleteShortUrl(user.id, id);
    return new Response(JSON.stringify({ message: 'Enlace eliminado correctamente' }), { status: 200 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status });
    }
    console.error('Error deleting short link:', error);
    return new Response(JSON.stringify({ error: 'Error interno al eliminar el enlace' }), { status: 500 });
  }
};

// PATCH /api/shorten/[id] - Update a short link's target URL or customized slug
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const user = locals.user;
  const { id } = params; // Current slug

  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }
  if (!id) {
    return new Response(JSON.stringify({ error: 'Falta el identificador del enlace' }), { status: 400 });
  }

  try {
    const { originalUrl, newSlug } = await request.json();
    const { slug } = await urlService.updateShortUrl(user.id, id, originalUrl, newSlug);

    return new Response(JSON.stringify({ slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return new Response(JSON.stringify({ error: error.message }), { status: error.status });
    }
    console.error('Error updating short link:', error);
    return new Response(JSON.stringify({ error: 'Error interno al actualizar el enlace' }), { status: 500 });
  }
};
