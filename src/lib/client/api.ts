import type { ShortUrl } from '../../types/url';

async function parseJsonOrThrow(res: Response, fallbackMessage: string) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export async function fetchUrlHistory(): Promise<ShortUrl[]> {
  const res = await fetch('/api/shorten');
  if (!res.ok) {
    throw new Error('No se pudo obtener el historial de enlaces');
  }
  return res.json();
}

export async function createShortLink(originalUrl: string, customSlug: string): Promise<{ slug: string }> {
  const res = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl, customSlug }),
  });
  return parseJsonOrThrow(res, 'Algo salió mal al acortar el enlace');
}

export async function updateShortLink(
  id: string,
  originalUrl: string,
  newSlug: string
): Promise<{ slug: string }> {
  const res = await fetch(`/api/shorten/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl, newSlug }),
  });
  return parseJsonOrThrow(res, 'No se pudo actualizar el enlace');
}

export async function deleteShortLink(id: string): Promise<void> {
  const res = await fetch(`/api/shorten/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'No se pudo eliminar el enlace');
  }
}
