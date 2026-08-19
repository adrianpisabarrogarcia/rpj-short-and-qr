import { useEffect, useState } from 'react';
import { generateQrDataUrl, type QrOptions } from '../lib/client/qr';

// Regenerates a QR code data URL whenever the target text or customization options change.
export function useQrPreview(text: string | null, options: QrOptions): string {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!text) {
      setDataUrl('');
      return;
    }

    let cancelled = false;
    generateQrDataUrl(text, options)
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => console.error('Error generating QR Canvas', err));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, options.color, options.bgColor, options.includeLogo]);

  return dataUrl;
}
