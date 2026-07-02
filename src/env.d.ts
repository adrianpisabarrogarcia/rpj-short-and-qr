declare namespace Astro {
  interface Locals {
    user: import('./auth').SessionUser | null;
  }
}
