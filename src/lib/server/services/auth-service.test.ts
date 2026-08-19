import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as userRepository from '../repositories/user-repository';
import { ServiceError } from '../errors';
import { verifyToken } from '../../../auth';
import { exchangeGoogleCode } from './auth-service';

vi.mock('../repositories/user-repository');

const repo = vi.mocked(userRepository);

const baseParams = {
  code: 'auth-code',
  redirectUri: 'https://rpj.es/api/auth/callback',
  clientId: 'client-id',
  clientSecret: 'client-secret',
};

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response;
}

function mockFetchSequence(tokenBody: unknown, userInfoBody?: unknown) {
  const fetchMock = vi.fn();
  fetchMock.mockResolvedValueOnce(jsonResponse(tokenBody));
  if (userInfoBody !== undefined) {
    fetchMock.mockResolvedValueOnce(jsonResponse(userInfoBody));
  }
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exchangeGoogleCode', () => {
  it('throws when the token exchange fails', async () => {
    mockFetchSequence({ error: 'invalid_grant' });

    await expect(exchangeGoogleCode(baseParams)).rejects.toMatchObject({
      status: 400,
      message: 'token_exchange_failed',
    } satisfies Partial<ServiceError>);
    expect(repo.upsertFromGoogleProfile).not.toHaveBeenCalled();
  });

  it('throws when Google does not return an email', async () => {
    mockFetchSequence({ access_token: 'tok' }, { id: 'g-1', name: 'No Email' });

    await expect(exchangeGoogleCode(baseParams)).rejects.toMatchObject({
      status: 400,
      message: 'no_email_provided',
    });
  });

  it('rejects domains outside @rpj.es', async () => {
    mockFetchSequence({ access_token: 'tok' }, { id: 'g-1', email: 'user@gmail.com', name: 'Outsider' });

    await expect(exchangeGoogleCode(baseParams)).rejects.toMatchObject({
      status: 403,
      message: 'invalid_domain',
    });
    expect(repo.upsertFromGoogleProfile).not.toHaveBeenCalled();
  });

  it('upserts the user and issues a valid session token for @rpj.es accounts', async () => {
    mockFetchSequence(
      { access_token: 'tok' },
      { id: 'g-1', email: 'persona@rpj.es', name: 'Persona RPJ', picture: 'https://pic' }
    );

    const { token, user } = await exchangeGoogleCode(baseParams);

    expect(user).toEqual({ id: 'g-1', email: 'persona@rpj.es', name: 'Persona RPJ', picture: 'https://pic' });
    expect(repo.upsertFromGoogleProfile).toHaveBeenCalledWith(user);

    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ id: 'g-1', email: 'persona@rpj.es' });
  });

  it('falls back to a default name when Google omits it', async () => {
    mockFetchSequence({ access_token: 'tok' }, { id: 'g-2', email: 'sinnombre@rpj.es' });

    const { user } = await exchangeGoogleCode(baseParams);

    expect(user.name).toBe('RPJ Member');
  });
});
