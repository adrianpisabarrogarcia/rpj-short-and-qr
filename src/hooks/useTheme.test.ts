/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from './useTheme';

function stubMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  stubMatchMedia(false);
});

describe('useTheme', () => {
  it('uses the saved theme from localStorage over the system preference', () => {
    localStorage.setItem('theme', 'light');
    stubMatchMedia(true); // system prefers dark, but the saved choice should win

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('falls back to the system preference when nothing is saved', () => {
    stubMatchMedia(true);
    const { result: darkResult } = renderHook(() => useTheme());
    expect(darkResult.current.theme).toBe('dark');

    stubMatchMedia(false);
    const { result: lightResult } = renderHook(() => useTheme());
    expect(lightResult.current.theme).toBe('light');
  });

  it('toggleTheme flips the theme, persists it, and mirrors it onto <html>', () => {
    localStorage.setItem('theme', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
