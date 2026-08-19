import * as urlRepository from '../repositories/url-repository';
import { isValidUrl, isValidSlug, isReservedSlug, normalizeSlug } from '../validators/url-validators';
import { ServiceError } from '../errors';
import type { ShortUrl } from '../../../types/url';

function generateRandomSlug(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateRandomSlug();
    if (!(await urlRepository.existsSlug(candidate))) {
      return candidate;
    }
  }
  throw new ServiceError(500, 'No se pudo generar un identificador único. Reintente de nuevo.');
}

function assertValidCustomSlug(slug: string): void {
  if (!isValidSlug(slug)) {
    throw new ServiceError(
      400,
      'El alias personalizado contiene caracteres inválidos. Solo letras, números, guiones y barras bajas.'
    );
  }
  if (isReservedSlug(slug)) {
    throw new ServiceError(400, 'Este alias no está disponible.');
  }
}

export async function createShortUrl(
  userId: string,
  originalUrl: string,
  customSlug?: string
): Promise<{ slug: string }> {
  if (!originalUrl) {
    throw new ServiceError(400, 'La URL original es requerida');
  }
  if (!isValidUrl(originalUrl)) {
    throw new ServiceError(400, 'La URL introducida no es válida. Debe incluir http:// o https://');
  }

  let slug: string;

  if (customSlug && customSlug.trim().length > 0) {
    slug = normalizeSlug(customSlug);
    assertValidCustomSlug(slug);

    if (await urlRepository.existsSlug(slug)) {
      throw new ServiceError(409, 'Este alias personalizado ya está en uso');
    }
  } else {
    slug = await generateUniqueSlug();
  }

  await urlRepository.insert({
    id: slug,
    originalUrl,
    createdById: userId,
    clicks: 0,
    createdAt: new Date(),
  });

  return { slug };
}

export async function updateShortUrl(
  userId: string,
  currentSlug: string,
  originalUrl: string,
  newSlug?: string
): Promise<{ slug: string }> {
  if (!originalUrl) {
    throw new ServiceError(400, 'La URL original es requerida');
  }
  if (!isValidUrl(originalUrl)) {
    throw new ServiceError(400, 'La URL introducida no es válida');
  }

  const existing = await urlRepository.findByOwnedSlug(currentSlug, userId);
  if (!existing) {
    throw new ServiceError(404, 'Enlace no encontrado o no tienes permisos');
  }

  const targetSlug = newSlug ? normalizeSlug(newSlug) : currentSlug;

  if (targetSlug !== currentSlug) {
    assertValidCustomSlug(targetSlug);

    if (await urlRepository.existsSlug(targetSlug)) {
      throw new ServiceError(409, 'El nuevo alias ya está en uso');
    }

    // SQLite/Turso no permite modificar una primary key in-place; se recrea el registro en una transacción.
    await urlRepository.replaceSlug(currentSlug, {
      id: targetSlug,
      originalUrl,
      createdById: userId,
      clicks: existing.clicks,
      createdAt: existing.createdAt,
    });
  } else {
    await urlRepository.updateOriginalUrl(currentSlug, originalUrl);
  }

  return { slug: targetSlug };
}

export async function deleteShortUrl(userId: string, slug: string): Promise<void> {
  const existing = await urlRepository.findByOwnedSlug(slug, userId);
  if (!existing) {
    throw new ServiceError(404, 'Enlace no encontrado o no tienes permisos');
  }
  await urlRepository.remove(slug);
}

export async function listUserUrls(userId: string): Promise<ShortUrl[]> {
  return urlRepository.findByUser(userId);
}

export async function resolveAndRegisterClick(slug: string): Promise<ShortUrl | null> {
  const found = await urlRepository.findBySlug(slug);
  if (!found) return null;

  try {
    await urlRepository.incrementClicks(slug);
  } catch (err) {
    console.error(`Failed to increment click stats for code: ${slug}`, err);
  }

  return found;
}
