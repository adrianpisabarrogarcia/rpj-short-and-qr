import { defineMiddleware } from 'astro:middleware';
import { getUserFromSession } from './auth';

export const onRequest = defineMiddleware(async (context, next) => {
  // Get user from cookie token
  const user = await getUserFromSession(context.request);
  context.locals.user = user;

  const url = new URL(context.request.url);

  // Protect dashboard routes (e.g. root page when requesting actions, or specific subpages)
  // But allow auth callbacks, static files, and redirection path
  const isAuthRoute = url.pathname.startsWith('/api/auth');
  const isApiShorten = url.pathname === '/api/shorten';
  
  if (isApiShorten && !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return next();
});
