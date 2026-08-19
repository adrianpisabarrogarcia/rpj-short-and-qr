import { Clock, Copy, Check, BarChart2, QrCode, Edit2, Trash2, ExternalLink } from 'lucide-react';
import type { ShortUrl } from '../../types/url';

interface LinksHistoryTableProps {
  urls: ShortUrl[];
  loading: boolean;
  copiedSlug: string | null;
  onCopy: (text: string, slug: string) => void;
  onViewQr: (slug: string) => void;
  onEdit: (item: ShortUrl) => void;
  onDelete: (slug: string) => void;
}

export default function LinksHistoryTable({
  urls,
  loading,
  copiedSlug,
  onCopy,
  onViewQr,
  onEdit,
  onDelete,
}: LinksHistoryTableProps) {
  return (
    <section className="p-6 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl transition-colors duration-200">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-[#94C700]/10 rounded-lg text-[#94C700]">
          <Clock size={20} />
        </div>
        <h3 className="text-[#1c1d1a] dark:text-white text-lg font-bold">Mis Enlaces Recientes</h3>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-[#6d7067] dark:text-[#575855]">
          <span className="w-6 h-6 border-2 border-[#94C700] border-t-transparent rounded-full animate-spin mb-2"></span>
          <p className="text-xs font-mono">Obteniendo tus enlaces...</p>
        </div>
      ) : urls.length === 0 ? (
        <div className="text-center py-12 text-[#6d7067] dark:text-[#575855]">
          <p className="text-sm">Aún no has generado ningún enlace acortado.</p>
          <p className="text-xs mt-1">¡Toma la iniciativa y crea el primero!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#edf0e8] dark:border-[#1c1d1a] text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Enlace Corto</th>
                <th className="pb-3 hidden md:table-cell">URL Original</th>
                <th className="pb-3 text-center">Clics</th>
                <th className="pb-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0e8] dark:divide-[#1c1d1a]/50 text-sm text-[#1c1d1a] dark:text-[#d4d8cc]">
              {urls.map((item) => {
                const shortUrl = `${window.location.protocol}//${window.location.host}/${item.id}`;
                return (
                  <tr key={item.id} className="hover:bg-[#f5f7f2] dark:hover:bg-[#1c1d1a]/20 transition group">
                    <td className="py-4 pl-2 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-[#94C700] font-semibold">{window.location.host}/{item.id}</span>
                        <button
                          onClick={() => onCopy(shortUrl, item.id)}
                          className="p-1 text-[#6d7067] dark:text-[#575855] hover:text-[#94C700] bg-[#edf0e8] dark:bg-[#1c1d1a] rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Copiar URL"
                        >
                          {copiedSlug === item.id ? <Check size={12} className="text-[#94C700]" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell max-w-xs truncate text-[#6d7067] dark:text-[#575855] font-mono text-xs">
                      {item.originalUrl}
                    </td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#94C700]/10 text-[#94C700] border border-[#94C700]/20">
                        <BarChart2 size={12} /> {item.clicks}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewQr(item.id)}
                          className="p-1.5 text-[#6d7067] dark:text-[#575855] hover:text-[#80CAE3] bg-[#ffffff] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition cursor-pointer"
                          title="Ver Código QR"
                        >
                          <QrCode size={14} />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-[#6d7067] dark:text-[#575855] hover:text-[#94C700] bg-[#ffffff] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition cursor-pointer"
                          title="Editar Enlace"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 text-[#6d7067] dark:text-[#575855] hover:text-red-500 bg-[#ffffff] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition cursor-pointer"
                          title="Eliminar Enlace"
                        >
                          <Trash2 size={14} />
                        </button>
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#6d7067] dark:text-[#575855] hover:text-black dark:hover:text-white bg-[#ffffff] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition"
                          title="Abrir enlace"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
