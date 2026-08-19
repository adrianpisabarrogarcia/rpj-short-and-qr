/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../lib/client/api';
import type { ShortUrl } from '../types/url';
import { useUrlHistory } from './useUrlHistory';

vi.mock('../lib/client/api');

const apiMock = vi.mocked(api);

function makeUrl(overrides: Partial<ShortUrl> = {}): ShortUrl {
  return {
    id: 'abc123',
    originalUrl: 'https://example.com',
    createdById: 'user-1',
    clicks: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useUrlHistory', () => {
  it('starts in a loading state and loads the history on mount', async () => {
    const urls = [makeUrl()];
    apiMock.fetchUrlHistory.mockResolvedValue(urls);

    const { result } = renderHook(() => useUrlHistory());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.urls).toEqual(urls);
  });

  it('stops loading and keeps an empty list when the fetch fails', async () => {
    apiMock.fetchUrlHistory.mockRejectedValue(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useUrlHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.urls).toEqual([]);

    consoleSpy.mockRestore();
  });

  it('refresh() re-fetches and updates the list', async () => {
    const refreshed = [makeUrl({ id: 'new-slug' })];
    apiMock.fetchUrlHistory.mockResolvedValueOnce([]).mockResolvedValueOnce(refreshed);

    const { result } = renderHook(() => useUrlHistory());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.urls).toEqual(refreshed);
    expect(apiMock.fetchUrlHistory).toHaveBeenCalledTimes(2);
  });
});
