import type { APIRoute } from 'astro';
import { db } from '../../db';
import { urls } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Helper to generate a random slug of 6 alphanumeric characters
function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { originalUrl, customSlug } = body;

    if (!originalUrl) {
      return new Response(JSON.stringify({ error: 'La URL original es requerida' }), { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      return new Response(JSON.stringify({ error: 'La URL introducida no es válida. Debe incluir http:// o https://' }), { status: 400 });
    }

    let slug = '';
    
    if (customSlug && customSlug.trim().length > 0) {
      slug = customSlug.trim().toLowerCase();
      
      // Slug validation (alphanumeric and dashes/underscores)
      const slugRegex = /^[a-zA-Z0-9-_]+$/;
      if (!slugRegex.test(slug)) {
        return new Response(
          JSON.stringify({ error: 'El alias personalizado contiene caracteres inválidos. Solo letras, números, guiones y barras bajas.' }), 
          { status: 400 }
        );
      }

      // Check if custom slug is reserved API paths
      const reserved = ['api', '404', 'login', 'logout', 'dashboard'];
      if (reserved.includes(slug)) {
        return new Response(JSON.stringify({ error: 'Este alias no está disponible.' }), { status: 400 });
      }

      // Check if custom slug already exists
      const existing = await db.select().from(urls).where(eq(urls.id, slug)).limit(1);
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: 'Este alias personalizado ya está en uso' }), { status: 409 });
      }
    } else {
      // Generate random unique slug
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 5) {
        slug = generateRandomSlug();
        const existing = await db.select().from(urls).where(eq(urls.id, slug)).limit(1);
        if (existing.length === 0) {
          unique = true;
        }
        attempts++;
      }
      if (!unique) {
        return new Response(JSON.stringify({ error: 'No se pudo generar un identificador único. Reintente de nuevo.' }), { status: 500 });
      }
    }

    // Insert URL link in database
    await db.insert(urls).values({
      id: slug,
      originalUrl,
      createdById: user.id,
      clicks: 0,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ slug }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
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
    // Fetch URLs created by user sorted by creation date
    const userUrls = await db
      .select()
      .from(urls)
      .where(eq(urls.createdById, user.id));

    userUrls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return new Response(JSON.stringify(userUrls), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener URLs' }), { status: 500 });
  }
};
