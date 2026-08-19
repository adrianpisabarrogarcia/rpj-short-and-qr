import type { ShortUrl } from '../../../types/url';

interface EditLinkModalProps {
  editingUrl: ShortUrl | null;
  editOriginalUrl: string;
  editSlug: string;
  editLoading: boolean;
  editError: string;
  onOriginalUrlChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function EditLinkModal({
  editingUrl,
  editOriginalUrl,
  editSlug,
  editLoading,
  editError,
  onOriginalUrlChange,
  onSlugChange,
  onSubmit,
  onClose,
}: EditLinkModalProps) {
  if (!editingUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[#1c1d1a] dark:text-white font-bold text-lg">Editar Enlace</h3>
        <p className="text-xs text-[#6d7067] dark:text-[#575855]">Modifica los parámetros de este enlace acortado. Los clics acumulados se conservarán.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">URL Destino</label>
            <input
              type="url"
              value={editOriginalUrl}
              onChange={(e) => onOriginalUrlChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#f5f7f2] dark:bg-[#0e0f0c] text-[#1c1d1a] dark:text-white border border-[#edf0e8] dark:border-[#1c1d1a] rounded-xl focus:border-[#94C700] outline-none transition"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">Alias Corto</label>
            <div className="flex rounded-xl bg-[#f5f7f2] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] focus-within:border-[#94C700] transition overflow-hidden">
              <span className="px-3 py-2.5 text-xs text-[#6d7067] dark:text-[#575855] font-semibold border-r border-[#edf0e8] dark:border-[#1c1d1a] select-none flex items-center">
                rpj.es/
              </span>
              <input
                type="text"
                value={editSlug}
                onChange={(e) => onSlugChange(e.target.value)}
                className="flex-grow px-3 py-2.5 bg-transparent text-[#1c1d1a] dark:text-white outline-none text-sm"
                required
              />
            </div>
          </div>

          {editError && (
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{editError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#edf0e8] dark:bg-[#1c1d1a] border border-[#edf0e8] dark:border-[#2b2d28] text-[#1c1d1a] dark:text-white font-semibold rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#22231f] transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="flex-1 py-2.5 bg-[#94C700] hover:bg-[#a7e100] text-black font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {editLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
