/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as qr from '../lib/client/qr';
import { useQrPreview } from './useQrPreview';

vi.mock('../lib/client/qr');

const qrMock = vi.mocked(qr);

const options = { color: '#000000', bgColor: '#ffffff', includeLogo: true };

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useQrPreview', () => {
  it('returns an empty string and does not generate anything when text is null', () => {
    const { result } = renderHook(() => useQrPreview(null, options));

    expect(result.current).toBe('');
    expect(qrMock.generateQrDataUrl).not.toHaveBeenCalled();
  });

  it('generates a data URL for the given text and options', async () => {
    qrMock.generateQrDataUrl.mockResolvedValue('data:image/png;base64,xyz');

    const { result } = renderHook(() => useQrPreview('https://rpj.es/abc123', options));

    await waitFor(() => expect(result.current).toBe('data:image/png;base64,xyz'));
    expect(qrMock.generateQrDataUrl).toHaveBeenCalledWith('https://rpj.es/abc123', options);
  });

  it('regenerates when the customization options change', async () => {
    qrMock.generateQrDataUrl.mockResolvedValueOnce('data:first').mockResolvedValueOnce('data:second');

    const { result, rerender } = renderHook(
      ({ opts }) => useQrPreview('https://rpj.es/abc123', opts),
      { initialProps: { opts: options } }
    );

    await waitFor(() => expect(result.current).toBe('data:first'));

    rerender({ opts: { ...options, color: '#94C700' } });

    await waitFor(() => expect(result.current).toBe('data:second'));
    expect(qrMock.generateQrDataUrl).toHaveBeenCalledTimes(2);
  });
});
