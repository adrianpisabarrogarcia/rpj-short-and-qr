import { describe, expect, it } from 'vitest';
import { isValidUrl, isValidSlug, isReservedSlug, normalizeSlug, RESERVED_SLUGS } from './url-validators';

describe('isValidUrl', () => {
  it('accepts absolute http/https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com/path?x=1')).toBe(true);
  });

  it('rejects strings without a protocol', () => {
    expect(isValidUrl('example.com')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('isValidSlug', () => {
  it('accepts alphanumeric, dashes and underscores', () => {
    expect(isValidSlug('evento-verano_26')).toBe(true);
    expect(isValidSlug('abc123')).toBe(true);
  });

  it('rejects slugs with spaces or special characters', () => {
    expect(isValidSlug('evento verano')).toBe(false);
    expect(isValidSlug('evento/verano')).toBe(false);
    expect(isValidSlug('evento.verano')).toBe(false);
    expect(isValidSlug('')).toBe(false);
  });
});

describe('isReservedSlug', () => {
  it('flags every entry in RESERVED_SLUGS', () => {
    for (const slug of RESERVED_SLUGS) {
      expect(isReservedSlug(slug)).toBe(true);
    }
  });

  it('does not flag an arbitrary custom slug', () => {
    expect(isReservedSlug('evento-verano')).toBe(false);
  });
});

describe('normalizeSlug', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeSlug('  Evento-Verano  ')).toBe('evento-verano');
  });
});
