import { Link, ArrowRight } from 'lucide-react';

interface LinkFormProps {
  originalUrl: string;
  customSlug: string;
  loading: boolean;
  error: string;
  onOriginalUrlChange: (value: string) => void;
  onCustomSlugChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LinkForm({
  originalUrl,
  customSlug,
  loading,
  error,
  onOriginalUrlChange,
  onCustomSlugChange,
  onSubmit,
}: LinkFormProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#94C700]/10 rounded-lg text-[#94C700]">
          <Link size={20} />
        </div>
        <h3 className="text-[#1c1d1a] dark:text-white text-lg font-bold">Acortador de Enlaces</h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">URL Original</label>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => onOriginalUrlChange(e.target.value)}
            placeholder="https://example.com/muy-larga-y-compleja"
            className="w-full px-4 py-3 bg-[#f5f7f2] dark:bg-[#0e0f0c] text-[#1c1d1a] dark:text-white border border-[#edf0e8] dark:border-[#1c1d1a] rounded-xl focus:border-[#94C700] dark:focus:border-[#94C700] outline-none transition placeholder-[#6d7067] dark:placeholder-[#575855]"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">Alias Personalizado (Opcional)</label>
            <span className="text-[10px] text-[#6d7067] dark:text-[#575855] font-mono">Solo letras, números y guiones</span>
          </div>
          <div className="flex rounded-xl bg-[#f5f7f2] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] focus-within:border-[#94C700] dark:focus-within:border-[#94C700] transition overflow-hidden">
            <span className="px-3 py-3 text-xs text-[#6d7067] dark:text-[#575855] font-semibold border-r border-[#edf0e8] dark:border-[#1c1d1a] select-none flex items-center">
              rpj.es/
            </span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => onCustomSlugChange(e.target.value)}
              placeholder="evento-verano"
              className="flex-grow px-4 py-3 bg-transparent text-[#1c1d1a] dark:text-white outline-none placeholder-[#6d7067] dark:placeholder-[#575855] text-sm"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#94C700] text-black font-bold rounded-xl hover:bg-[#a7e100] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>Generar Enlace Corto <ArrowRight size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
}
