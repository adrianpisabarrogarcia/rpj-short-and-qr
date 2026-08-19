export const RESERVED_SLUGS = ['api', '404', 'login', 'logout', 'dashboard'];

const SLUG_REGEX = /^[a-zA-Z0-9-_]+$/;

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug);
}

export function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase();
}
