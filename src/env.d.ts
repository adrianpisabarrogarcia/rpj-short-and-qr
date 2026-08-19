declare namespace App {
  interface Locals {
    user: import('./auth').SessionUser | null;
  }
}
