import * as userRepository from '../repositories/user-repository';
import { generateToken, type SessionUser } from '../../../auth';
import { ServiceError } from '../errors';

const ALLOWED_EMAIL_DOMAIN = '@rpj.es';

interface ExchangeParams {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}

export async function exchangeGoogleCode({
  code,
  redirectUri,
  clientId,
  clientSecret,
}: ExchangeParams): Promise<{ token: string; user: SessionUser }> {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.error) {
    throw new ServiceError(400, 'token_exchange_failed');
  }

  const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const googleUser = await userResponse.json();

  if (!googleUser.email) {
    throw new ServiceError(400, 'no_email_provided');
  }

  // CRITICAL SECURITY ENFORCEMENT: Only allow @rpj.es domains
  if (!googleUser.email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
    throw new ServiceError(403, 'invalid_domain');
  }

  const sessionUser: SessionUser = {
    id: googleUser.id,
    email: googleUser.email,
    name: googleUser.name || 'RPJ Member',
    picture: googleUser.picture || '',
  };

  await userRepository.upsertFromGoogleProfile(sessionUser);

  const token = generateToken(sessionUser);

  return { token, user: sessionUser };
}
