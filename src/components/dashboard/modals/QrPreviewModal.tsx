interface QrPreviewModalProps {
  selectedQr: { url: string; slug: string } | null;
  qrDataUrl: string;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export default function QrPreviewModal({ selectedQr, qrDataUrl, onClose, onCopy }: QrPreviewModalProps) {
  if (!selectedQr) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#1c1d1a] dark:text-white font-bold text-sm truncate font-mono">rpj.es/{selectedQr.slug}</span>
          <button
            onClick={onClose}
            className="text-[#6d7067] dark:text-[#575855] hover:text-black dark:hover:text-white text-xs font-semibold cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        <div className="bg-[#f5f7f2] dark:bg-[#1c1d1a]/50 p-4 rounded-xl inline-block border border-[#edf0e8] dark:border-[#1c1d1a] shadow-lg mx-auto">
          <div className="p-2 bg-white rounded-lg">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Código QR Grande Personalizado" className="w-56 h-56 mx-auto animate-fade-in" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-black text-xs font-mono">Generando...</div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onCopy(selectedQr.url)}
            className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#edf0e8] dark:bg-[#1c1d1a] border border-[#edf0e8] dark:border-[#2b2d28] hover:text-black dark:hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Copiar Enlace
          </button>
          <a
            href={qrDataUrl}
            download={`qr-rpj-${selectedQr.slug}.png`}
            className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#94C700] hover:bg-[#a7e100] text-black rounded-lg text-xs font-semibold transition font-bold"
          >
            Descargar PNG
          </a>
        </div>
      </div>
    </div>
  );
}
