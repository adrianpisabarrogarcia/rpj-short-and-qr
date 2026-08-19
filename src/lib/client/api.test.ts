import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createShortLink, deleteShortLink, fetchUrlHistory, updateShortLink } from './api';

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchUrlHistory', () => {
  it('returns the parsed list on success', async () => {
    const urls = [{ id: 'abc', originalUrl: 'https://x.com', createdById: 'u1', clicks: 0, createdAt: new Date() }];
    mockFetch(jsonResponse(urls));

    await expect(fetchUrlHistory()).resolves.toEqual(urls);
  });

  it('throws when the response is not ok', async () => {
    mockFetch(jsonResponse({}, false));

    await expect(fetchUrlHistory()).rejects.toThrow('No se pudo obtener el historial de enlaces');
  });
});

describe('createShortLink', () => {
  it('posts to /api/shorten and returns the slug', async () => {
    const fetchMock = mockFetch(jsonResponse({ slug: 'evento-verano' }));

    const result = await createShortLink('https://example.com', 'evento-verano');

    expect(result).toEqual({ slug: 'evento-verano' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/shorten',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: 'https://example.com', customSlug: 'evento-verano' }),
      })
    );
  });

  it('throws the server-provided error message on failure', async () => {
    mockFetch(jsonResponse({ error: 'Este alias personalizado ya está en uso' }, false));

    await expect(createShortLink('https://example.com', 'taken')).rejects.toThrow(
      'Este alias personalizado ya está en uso'
    );
  });

  it('falls back to a generic error message when the server sends none', async () => {
    mockFetch(jsonResponse({}, false));

    await expect(createShortLink('https://example.com', '')).rejects.toThrow(
      'Algo salió mal al acortar el enlace'
    );
  });
});

describe('updateShortLink', () => {
  it('sends a PATCH request with the new URL and slug', async () => {
    const fetchMock = mockFetch(jsonResponse({ slug: 'nuevo-slug' }));

    const result = await updateShortLink('abc123', 'https://example.com', 'nuevo-slug');

    expect(result).toEqual({ slug: 'nuevo-slug' });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/shorten/abc123',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ originalUrl: 'https://example.com', newSlug: 'nuevo-slug' }),
      })
    );
  });

  it('throws on failure', async () => {
    mockFetch(jsonResponse({ error: 'El nuevo alias ya está en uso' }, false));

    await expect(updateShortLink('abc123', 'https://example.com', 'taken')).rejects.toThrow(
      'El nuevo alias ya está en uso'
    );
  });
});

describe('deleteShortLink', () => {
  it('sends a DELETE request and resolves on success', async () => {
    const fetchMock = mockFetch(jsonResponse({}));

    await expect(deleteShortLink('abc123')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/shorten/abc123', { method: 'DELETE' });
  });

  it('throws the server-provided error message on failure', async () => {
    mockFetch(jsonResponse({ error: 'Enlace no encontrado o no tienes permisos' }, false));

    await expect(deleteShortLink('missing')).rejects.toThrow('Enlace no encontrado o no tienes permisos');
  });
});
