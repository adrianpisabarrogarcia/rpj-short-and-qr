import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ redirect }) => {
  // Clear the cookie by setting Max-Age to 0
  const isProduction = import.meta.env.PROD;
  const cookieString = `session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${isProduction ? ' Secure;' : ''}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': cookieString,
    },
  });
};
