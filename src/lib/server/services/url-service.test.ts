import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as urlRepository from '../repositories/url-repository';
import { ServiceError } from '../errors';
import type { ShortUrl } from '../../../types/url';
import {
  createShortUrl,
  deleteShortUrl,
  listUserUrls,
  resolveAndRegisterClick,
  updateShortUrl,
} from './url-service';

vi.mock('../repositories/url-repository');

const repo = vi.mocked(urlRepository);

function makeUrl(overrides: Partial<ShortUrl> = {}): ShortUrl {
  return {
    id: 'abc123',
    originalUrl: 'https://example.com',
    createdById: 'user-1',
    clicks: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('createShortUrl', () => {
  it('rejects a missing original URL', async () => {
    await expect(createShortUrl('user-1', '')).rejects.toMatchObject({
      status: 400,
    } satisfies Partial<ServiceError>);
  });

  it('rejects an invalid original URL', async () => {
    await expect(createShortUrl('user-1', 'not-a-url')).rejects.toThrow(ServiceError);
  });

  it('rejects a custom slug with invalid characters', async () => {
    await expect(createShortUrl('user-1', 'https://example.com', 'has spaces')).rejects.toMatchObject({
      status: 400,
    });
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it('rejects a reserved custom slug', async () => {
    await expect(createShortUrl('user-1', 'https://example.com', 'api')).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects a custom slug already in use', async () => {
    repo.existsSlug.mockResolvedValue(true);

    await expect(createShortUrl('user-1', 'https://example.com', 'taken')).rejects.toMatchObject({
      status: 409,
    });
  });

  it('normalizes and inserts a valid custom slug', async () => {
    repo.existsSlug.mockResolvedValue(false);

    const result = await createShortUrl('user-1', 'https://example.com', '  Evento-Verano  ');

    expect(result).toEqual({ slug: 'evento-verano' });
    expect(repo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evento-verano', originalUrl: 'https://example.com', createdById: 'user-1', clicks: 0 })
    );
  });

  it('generates a random slug when none is provided', async () => {
    repo.existsSlug.mockResolvedValue(false);

    const result = await createShortUrl('user-1', 'https://example.com');

    expect(result.slug).toMatch(/^[a-zA-Z0-9]{6}$/);
    expect(repo.insert).toHaveBeenCalledWith(expect.objectContaining({ id: result.slug }));
  });

  it('throws after exhausting retries if every generated slug collides', async () => {
    repo.existsSlug.mockResolvedValue(true);

    await expect(createShortUrl('user-1', 'https://example.com')).rejects.toMatchObject({
      status: 500,
    });
    expect(repo.existsSlug).toHaveBeenCalledTimes(5);
    expect(repo.insert).not.toHaveBeenCalled();
  });
});

describe('updateShortUrl', () => {
  it('rejects a missing original URL', async () => {
    await expect(updateShortUrl('user-1', 'abc123', '')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an invalid original URL', async () => {
    await expect(updateShortUrl('user-1', 'abc123', 'not-a-url')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects when the link is not owned by the user', async () => {
    repo.findByOwnedSlug.mockResolvedValue(null);

    await expect(updateShortUrl('user-1', 'abc123', 'https://example.com')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('updates only the target URL when the slug does not change', async () => {
    repo.findByOwnedSlug.mockResolvedValue(makeUrl());

    const result = await updateShortUrl('user-1', 'abc123', 'https://new-example.com');

    expect(result).toEqual({ slug: 'abc123' });
    expect(repo.updateOriginalUrl).toHaveBeenCalledWith('abc123', 'https://new-example.com');
    expect(repo.replaceSlug).not.toHaveBeenCalled();
  });

  it('rejects renaming to an already-used slug', async () => {
    repo.findByOwnedSlug.mockResolvedValue(makeUrl());
    repo.existsSlug.mockResolvedValue(true);

    await expect(updateShortUrl('user-1', 'abc123', 'https://example.com', 'new-slug')).rejects.toMatchObject({
      status: 409,
    });
  });

  it('replaces the slug preserving clicks and creation date', async () => {
    const existing = makeUrl({ clicks: 42 });
    repo.findByOwnedSlug.mockResolvedValue(existing);
    repo.existsSlug.mockResolvedValue(false);

    const result = await updateShortUrl('user-1', 'abc123', 'https://example.com', 'New-Slug');

    expect(result).toEqual({ slug: 'new-slug' });
    expect(repo.replaceSlug).toHaveBeenCalledWith('abc123', {
      id: 'new-slug',
      originalUrl: 'https://example.com',
      createdById: 'user-1',
      clicks: 42,
      createdAt: existing.createdAt,
    });
  });
});

describe('deleteShortUrl', () => {
  it('rejects when the link is not owned by the user', async () => {
    repo.findByOwnedSlug.mockResolvedValue(null);

    await expect(deleteShortUrl('user-1', 'abc123')).rejects.toMatchObject({ status: 404 });
    expect(repo.remove).not.toHaveBeenCalled();
  });

  it('removes the link when owned by the user', async () => {
    repo.findByOwnedSlug.mockResolvedValue(makeUrl());

    await deleteShortUrl('user-1', 'abc123');

    expect(repo.remove).toHaveBeenCalledWith('abc123');
  });
});

describe('listUserUrls', () => {
  it('delegates to the repository', async () => {
    const urls = [makeUrl()];
    repo.findByUser.mockResolvedValue(urls);

    await expect(listUserUrls('user-1')).resolves.toBe(urls);
    expect(repo.findByUser).toHaveBeenCalledWith('user-1');
  });
});

describe('resolveAndRegisterClick', () => {
  it('returns null without registering a click when the slug is unknown', async () => {
    repo.findBySlug.mockResolvedValue(null);

    const result = await resolveAndRegisterClick('missing');

    expect(result).toBeNull();
    expect(repo.incrementClicks).not.toHaveBeenCalled();
  });

  it('registers a click and returns the record when found', async () => {
    const found = makeUrl();
    repo.findBySlug.mockResolvedValue(found);

    const result = await resolveAndRegisterClick('abc123');

    expect(result).toBe(found);
    expect(repo.incrementClicks).toHaveBeenCalledWith('abc123');
  });

  it('still returns the record if registering the click fails', async () => {
    const found = makeUrl();
    repo.findBySlug.mockResolvedValue(found);
    repo.incrementClicks.mockRejectedValue(new Error('db offline'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await resolveAndRegisterClick('abc123');

    expect(result).toBe(found);
    consoleSpy.mockRestore();
  });
});
