import { Sparkles, Copy, Check, ExternalLink, Download, QrCode } from 'lucide-react';

interface ResultCardProps {
  result: { shortUrl: string; slug: string } | null;
  qrDataUrl: string;
  copied: boolean;
  onCopy: (text: string) => void;
}

export default function ResultCard({ result, qrDataUrl, copied, onCopy }: ResultCardProps) {
  return (
    <section className="p-6 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl flex flex-col justify-center min-h-[300px] transition-colors duration-200">
      {result ? (
        <div className="space-y-4 text-center">
          <h4 className="text-[#1c1d1a] dark:text-white font-bold text-md flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-[#94C700]" /> ¡Enlace Generado!
          </h4>

          {/* QR Preview Canvas with custom styles applied */}
          <div className="bg-[#f5f7f2] dark:bg-[#1c1d1a]/50 p-3 rounded-xl inline-block mx-auto border border-[#edf0e8] dark:border-[#1c1d1a] shadow-lg transition-transform hover:scale-105">
            <div className="p-2 bg-white rounded-lg">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Enlace Personalizado" className="w-36 h-36 animate-fade-in" />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-black text-xs font-mono">Renderizando...</div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {/* Short URL field */}
            <div className="flex items-center gap-2 p-2 bg-[#f5f7f2] dark:bg-[#0e0f0c] rounded-xl border border-[#edf0e8] dark:border-[#1c1d1a] text-sm">
              <span className="flex-grow font-mono text-[#94C700] dark:text-[#94C700] truncate text-center pl-2 font-semibold">{result.shortUrl}</span>
              <button
                onClick={() => onCopy(result.shortUrl)}
                className="p-2 text-[#6d7067] dark:text-[#575855] hover:text-[#94C700] dark:hover:text-[#94C700] bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition cursor-pointer"
                title="Copiar URL"
              >
                {copied ? <Check size={16} className="text-[#94C700]" /> : <Copy size={16} />}
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#f5f7f2] dark:bg-[#1c1d1a] border border-[#edf0e8] dark:border-[#2b2d28] hover:border-[#94C700]/50 dark:hover:border-[#94C700]/50 text-[#1c1d1a] dark:text-[#d4d8cc] hover:text-black dark:hover:text-white rounded-lg text-xs font-semibold transition"
              >
                Visitar <ExternalLink size={12} />
              </a>
              <a
                href={qrDataUrl}
                download={`qr-rpj-${result.slug}.png`}
                className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#94C700]/10 border border-[#94C700]/20 hover:border-[#94C700]/50 text-[#94C700] hover:text-[#a7e100] rounded-lg text-xs font-semibold transition"
              >
                Descargar QR <Download size={12} />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-3 py-6 text-[#6d7067] dark:text-[#575855]">
          <div className="w-12 h-12 rounded-full bg-[#f5f7f2] dark:bg-[#1c1d1a] flex items-center justify-center mx-auto mb-2 text-[#6d7067] dark:text-[#575855]">
            <QrCode size={24} />
          </div>
          <p className="text-sm font-semibold">Tus resultados aparecerán aquí</p>
          <p className="text-xs">Introduce una URL arriba y genera su versión corta y código QR automáticamente en un clic.</p>
        </div>
      )}
    </section>
  );
}
