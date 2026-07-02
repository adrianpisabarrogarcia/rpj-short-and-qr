import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  
  if (!GOOGLE_CLIENT_ID) {
    return new Response('Google Client ID is not configured.', { status: 500 });
  }

  const url = new URL(request.url);
  // Dynamically set redirect_uri based on current host (handles local dev and Vercel branch previews automatically)
  const redirectUri = `${url.protocol}//${url.host}/api/auth/callback`;

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return Response.redirect(`${rootUrl}?${qs.toString()}`);
};
