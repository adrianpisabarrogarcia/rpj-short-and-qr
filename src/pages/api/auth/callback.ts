import type { APIRoute } from 'astro';
import { exchangeGoogleCode } from '../../../lib/server/services/auth-service';
import { ServiceError } from '../../../lib/server/errors';

export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return redirect('/?error=no_auth_code');
  }

  const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = import.meta.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${url.protocol}//${url.host}/api/auth/callback`;

  try {
    const { token } = await exchangeGoogleCode({
      code,
      redirectUri,
      clientId: GOOGLE_CLIENT_ID || '',
      clientSecret: GOOGLE_CLIENT_SECRET || '',
    });

    // Save cookie and redirect back to root (dashboard)
    const isProduction = import.meta.env.PROD;
    const cookieString = `session_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60};${isProduction ? ' Secure;' : ''}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': cookieString,
      },
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      return redirect(`/?error=${error.message}`);
    }
    console.error('Error during Google Auth Callback:', error);
    return redirect('/?error=auth_error');
  }
};
