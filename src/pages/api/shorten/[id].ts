import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { urls } from '../../../db/schema';
import { eq, and } from 'drizzle-orm';

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
    // 1. Verify existence and ownership
    const existing = await db
      .select()
      .from(urls)
      .where(and(eq(urls.id, id), eq(urls.createdById, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return new Response(JSON.stringify({ error: 'Enlace no encontrado o no tienes permisos' }), { status: 404 });
    }

    // 2. Delete the record
    await db.delete(urls).where(eq(urls.id, id));

    return new Response(JSON.stringify({ message: 'Enlace eliminado correctamente' }), { status: 200 });
  } catch (error) {
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
    const body = await request.json();
    const { originalUrl, newSlug } = body;

    if (!originalUrl) {
      return new Response(JSON.stringify({ error: 'La URL original es requerida' }), { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      return new Response(JSON.stringify({ error: 'La URL introducida no es válida' }), { status: 400 });
    }

    // 1. Verify ownership
    const existing = await db
      .select()
      .from(urls)
      .where(and(eq(urls.id, id), eq(urls.createdById, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return new Response(JSON.stringify({ error: 'Enlace no encontrado o no tienes permisos' }), { status: 404 });
    }

    const currentUrlData = existing[0];
    const targetSlug = newSlug ? newSlug.trim().toLowerCase() : id;

    // 2. Check if slug changes and validate it
    if (targetSlug !== id) {
      // Format validation
      const slugRegex = /^[a-zA-Z0-9-_]+$/;
      if (!slugRegex.test(targetSlug)) {
        return new Response(
          JSON.stringify({ error: 'El nuevo alias contiene caracteres inválidos' }), 
          { status: 400 }
        );
      }

      // Check reserved names
      const reserved = ['api', '404', 'login', 'logout', 'dashboard'];
      if (reserved.includes(targetSlug)) {
        return new Response(JSON.stringify({ error: 'Este alias no está disponible' }), { status: 400 });
      }

      // Check if target slug already exists
      const conflict = await db.select().from(urls).where(eq(urls.id, targetSlug)).limit(1);
      if (conflict.length > 0) {
        return new Response(JSON.stringify({ error: 'El nuevo alias ya está en uso' }), { status: 409 });
      }

      // Re-create the record since SQLite primary keys can't be modified in-place atomically easily without constraints issues.
      // In SQLite/Turso, doing a delete then insert inside a transaction is the safest way to change a Primary Key.
      await db.transaction(async (tx) => {
        await tx.delete(urls).where(eq(urls.id, id));
        await tx.insert(urls).values({
          id: targetSlug,
          originalUrl,
          createdById: user.id,
          clicks: currentUrlData.clicks,
          createdAt: currentUrlData.createdAt,
        });
      });
    } else {
      // Only URL changes
      await db
        .update(urls)
        .set({ originalUrl })
        .where(eq(urls.id, id));
    }

    return new Response(JSON.stringify({ slug: targetSlug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating short link:', error);
    return new Response(JSON.stringify({ error: 'Error interno al actualizar el enlace' }), { status: 500 });
  }
};
