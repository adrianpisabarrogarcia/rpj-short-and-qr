import QRCode from 'qrcode';

export interface QrOptions {
  color: string;
  bgColor: string;
  includeLogo: boolean;
}

// Renders a QR code onto a canvas and (optionally) overlays the RPJ logo at its center.
export async function generateQrDataUrl(text: string, options: QrOptions): Promise<string> {
  const size = 600;
  const canvas = document.createElement('canvas');

  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H', // High error correction to support logo overlay
    color: {
      dark: options.color,
      light: options.bgColor,
    },
  });

  const ctx = canvas.getContext('2d');
  if (ctx && options.includeLogo) {
    const logoSize = size * 0.22;
    const x = (size - logoSize) / 2;
    const y = (size - logoSize) / 2;

    // Draw background card for logo
    ctx.fillStyle = options.bgColor === '#ffffff00' ? '#ffffff' : options.bgColor;
    ctx.beginPath();
    ctx.roundRect?.(x - 8, y - 8, logoSize + 16, logoSize + 16, 12);
    ctx.fill();

    // Load and draw the official logo.webp image onto canvas
    const img = new Image();
    img.src = '/logo.webp';
    await new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, x, y, logoSize, logoSize);
        resolve(true);
      };
      img.onerror = (err) => {
        console.error('Failed to load RPJ logo image in canvas', err);
        reject(err);
      };
    });
  }

  return canvas.toDataURL('image/png');
}
