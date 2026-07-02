import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { generateToken } from '../../../auth';

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
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return redirect('/?error=token_exchange_failed');
    }

    // 2. Fetch user details from Google API
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return redirect('/?error=no_email_provided');
    }

    // CRITICAL SECURITY ENFORCEMENT: Only allow @rpj.es domains
    if (!googleUser.email.endsWith('@rpj.es')) {
      return redirect('/?error=invalid_domain');
    }

    // 3. Upsert user in Turso DB
    await db
      .insert(users)
      .values({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name || 'RPJ Member',
        picture: googleUser.picture || '',
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: googleUser.name || 'RPJ Member',
          picture: googleUser.picture || '',
        },
      });

    // 4. Create session JWT and store in HTTP-only cookie
    const token = generateToken({
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name || 'RPJ Member',
      picture: googleUser.picture || '',
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
    console.error('Error during Google Auth Callback:', error);
    return redirect('/?error=auth_error');
  }
};
