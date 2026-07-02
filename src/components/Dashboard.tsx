import React, { useState, useEffect } from 'react';
import { 
  Link, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  LogOut, 
  ArrowRight,
  Sparkles,
  User,
  Clock,
  BarChart2,
  Download,
  Trash2,
  Edit2
} from 'lucide-react';
import QRCode from 'qrcode';

interface UrlData {
  id: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // URL creation result state
  const [result, setResult] = useState<{ shortUrl: string; slug: string; qrDataUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // History URLs
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  
  // Active QR preview modal
  const [selectedQr, setSelectedQr] = useState<{ url: string; slug: string; dataUrl: string } | null>(null);

  // Edit Link Modal State
  const [editingUrl, setEditingUrl] = useState<UrlData | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Link Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/shorten');
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    if (!originalUrl) {
      setError('Por favor, introduce una URL válida');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl, customSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Algo salió mal al acortar el enlace');
      }

      const shortUrl = `${window.location.protocol}//${window.location.host}/${data.slug}`;
      
      // Generate QR Code dynamic URL
      const qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setResult({
        shortUrl,
        slug: data.slug,
        qrDataUrl,
      });

      setOriginalUrl('');
      setCustomSlug('');
      fetchHistory(); // Refresh history
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle PATCH requests (Update link)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUrl) return;

    setEditLoading(true);
    setEditError('');

    try {
      const res = await fetch(`/api/shorten/${editingUrl.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: editOriginalUrl, newSlug: editSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No se pudo actualizar el enlace');
      }

      // Update Local history state
      setEditingUrl(null);
      fetchHistory();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle DELETE requests (Remove link)
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/shorten/${deletingId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'No se pudo eliminar el enlace');
      }

      // Clear from result card if active deleted
      if (result && result.slug === deletingId) {
        setResult(null);
      }

      setDeletingId(null);
      fetchHistory();
    } catch (err) {
      console.error('Error deleting link:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopy = (text: string, slug?: string) => {
    navigator.clipboard.writeText(text);
    if (slug) {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateAndOpenQr = async (slug: string) => {
    const shortUrl = `${window.location.protocol}//${window.location.host}/${slug}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(shortUrl, {
        width: 600,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setSelectedQr({ url: shortUrl, slug, dataUrl: qrDataUrl });
    } catch (err) {
      console.error('Error generating QR', err);
    }
  };

  const startEdit = (item: UrlData) => {
    setEditingUrl(item);
    setEditOriginalUrl(item.originalUrl);
    setEditSlug(item.id);
    setEditError('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header Info Panel */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-[#121310] border border-[#1c1d1a] rounded-2xl">
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-[#94C700]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#1c1d1a] flex items-center justify-center border border-[#94C700]/30">
              <User className="text-[#94C700]" />
            </div>
          )}
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              Hola, {user.name} <Sparkles size={16} className="text-[#94C700] animate-pulse" />
            </h2>
            <p className="text-[#575855] text-xs font-mono">{user.email}</p>
          </div>
        </div>
        <a 
          href="/api/auth/logout" 
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 cursor-pointer transition"
        >
          <LogOut size={16} /> Cerrar Sesión
        </a>
      </header>

      {/* Main Grid: Generator & Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Generator Panel */}
        <section className="lg:col-span-2 p-6 bg-[#121310] border border-[#1c1d1a] rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#94C700]/10 rounded-lg text-[#94C700]">
                <Link size={20} />
              </div>
              <h3 className="text-white text-lg font-bold">Acortador de Enlaces</h3>
            </div>
            
            <form onSubmit={handleShorten} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#575855] uppercase tracking-wider font-bold">URL Original</label>
                <input 
                  type="url" 
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/muy-larga-y-compleja"
                  className="w-full px-4 py-3 bg-[#0e0f0c] text-white border border-[#1c1d1a] rounded-xl focus:border-[#94C700] outline-none transition placeholder-[#575855]"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-[#575855] uppercase tracking-wider font-bold">Alias Personalizado (Opcional)</label>
                  <span className="text-[10px] text-[#575855] font-mono">Solo letras, números y guiones</span>
                </div>
                <div className="flex rounded-xl bg-[#0e0f0c] border border-[#1c1d1a] focus-within:border-[#94C700] transition overflow-hidden">
                  <span className="px-3 py-3 text-xs text-[#575855] font-semibold border-r border-[#1c1d1a] select-none flex items-center">
                    rpj.es/
                  </span>
                  <input 
                    type="text" 
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="evento-verano"
                    className="flex-grow px-4 py-3 bg-transparent text-white outline-none placeholder-[#575855] text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
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
        </section>

        {/* Dynamic Card Result */}
        <section className="p-6 bg-[#121310] border border-[#1c1d1a] rounded-2xl flex flex-col justify-center min-h-[300px]">
          {result ? (
            <div className="space-y-4 text-center">
              <h4 className="text-white font-bold text-md flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-[#94C700]" /> ¡Enlace Generado!
              </h4>
              
              {/* QR Preview */}
              <div className="bg-white p-3 rounded-xl inline-block mx-auto border-2 border-[#94C700]/30 shadow-lg shadow-[#94C700]/5 transition-transform hover:scale-105">
                <img src={result.qrDataUrl} alt="QR Enlace" className="w-36 h-36" />
              </div>
              
              <div className="space-y-2">
                {/* Short URL field */}
                <div className="flex items-center gap-2 p-2 bg-[#0e0f0c] rounded-xl border border-[#1c1d1a] text-sm">
                  <span className="flex-grow font-mono text-[#94C700] truncate text-center pl-2">{result.shortUrl}</span>
                  <button 
                    onClick={() => handleCopy(result.shortUrl)}
                    className="p-2 text-[#575855] hover:text-[#94C700] bg-[#121310] border border-[#1c1d1a] rounded-lg transition cursor-pointer"
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
                    className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1c1d1a] border border-[#2b2d28] hover:border-[#94C700]/50 hover:text-white rounded-lg text-xs font-semibold transition"
                  >
                    Visitar <ExternalLink size={12} />
                  </a>
                  <a 
                    href={result.qrDataUrl} 
                    download={`qr-rpj-${result.slug}.png`}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#94C700]/10 border border-[#94C700]/20 hover:border-[#94C700]/50 text-[#94C700] hover:text-[#a7e100] rounded-lg text-xs font-semibold transition"
                  >
                    Descargar QR <Download size={12} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 py-6 text-[#575855]">
              <div className="w-12 h-12 rounded-full bg-[#1c1d1a] flex items-center justify-center mx-auto mb-2 text-[#575855]">
                <QrCode size={24} />
              </div>
              <p className="text-sm font-semibold">Tus resultados aparecerán aquí</p>
              <p className="text-xs">Introduce una URL arriba y genera su versión corta y código QR automáticamente en un clic.</p>
            </div>
          )}
        </section>

      </div>

      {/* History Links List */}
      <section className="p-6 bg-[#121310] border border-[#1c1d1a] rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-[#94C700]/10 rounded-lg text-[#94C700]">
            <Clock size={20} />
          </div>
          <h3 className="text-white text-lg font-bold">Mis Enlaces Recientes</h3>
        </div>

        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-10 text-[#575855]">
            <span className="w-6 h-6 border-2 border-[#94C700] border-t-transparent rounded-full animate-spin mb-2"></span>
            <p className="text-xs font-mono">Obteniendo tus enlaces...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="text-center py-12 text-[#575855]">
            <p className="text-sm">Aún no has generado ningún enlace acortado.</p>
            <p className="text-xs mt-1">¡Toma la iniciativa y crea el primero!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1c1d1a] text-xs text-[#575855] uppercase tracking-wider font-bold">
                  <th className="pb-3 pl-2">Enlace Corto</th>
                  <th className="pb-3 hidden md:table-cell">URL Original</th>
                  <th className="pb-3 text-center">Clics</th>
                  <th className="pb-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1d1a]/50 text-sm text-[#d4d8cc]">
                {urls.map((item) => {
                  const shortUrl = `${window.location.protocol}//${window.location.host}/${item.id}`;
                  return (
                    <tr key={item.id} className="hover:bg-[#1c1d1a]/20 transition group">
                      <td className="py-4 pl-2 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[#94C700] font-semibold">{window.location.host}/{item.id}</span>
                          <button 
                            onClick={() => handleCopy(shortUrl, item.id)}
                            className="p-1 text-[#575855] hover:text-[#94C700] bg-[#1c1d1a] rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Copiar URL"
                          >
                            {copiedSlug === item.id ? <Check size={12} className="text-[#94C700]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 hidden md:table-cell max-w-xs truncate text-[#575855] font-mono text-xs">
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
                            onClick={() => generateAndOpenQr(item.id)}
                            className="p-1.5 text-[#575855] hover:text-[#80CAE3] bg-[#0e0f0c] border border-[#1c1d1a] rounded-lg transition cursor-pointer"
                            title="Ver Código QR"
                          >
                            <QrCode size={14} />
                          </button>
                          <button 
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-[#575855] hover:text-[#94C700] bg-[#0e0f0c] border border-[#1c1d1a] rounded-lg transition cursor-pointer"
                            title="Editar Enlace"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setDeletingId(item.id)}
                            className="p-1.5 text-[#575855] hover:text-red-400 bg-[#0e0f0c] border border-[#1c1d1a] rounded-lg transition cursor-pointer"
                            title="Eliminar Enlace"
                          >
                            <Trash2 size={14} />
                          </button>
                          <a 
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#575855] hover:text-white bg-[#0e0f0c] border border-[#1c1d1a] rounded-lg transition"
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

      {/* QR Preview Lightbox Modal */}
      {selectedQr && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQr(null)}
        >
          <div 
            className="bg-[#121310] border border-[#1c1d1a] p-6 rounded-2xl max-w-xs w-full text-center space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold text-sm truncate font-mono">rpj.es/{selectedQr.slug}</span>
              <button 
                onClick={() => setSelectedQr(null)}
                className="text-[#575855] hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-xl inline-block border-2 border-[#94C700]/30 shadow-lg">
              <img src={selectedQr.dataUrl} alt="Código QR Grande" className="w-56 h-56 mx-auto" />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(selectedQr.url)}
                className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1c1d1a] border border-[#2b2d28] hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Copiar Enlace
              </button>
              <a 
                href={selectedQr.dataUrl} 
                download={`qr-rpj-${selectedQr.slug}.png`}
                className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#94C700] hover:bg-[#a7e100] text-black rounded-lg text-xs font-semibold transition font-bold"
              >
                Descargar PNG
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {editingUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setEditingUrl(null)}
        >
          <div 
            className="bg-[#121310] border border-[#1c1d1a] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg">Editar Enlace</h3>
            <p className="text-xs text-[#575855]">Modifica los parámetros de este enlace acortado. Los clics acumulados se conservarán.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#575855] uppercase tracking-wider font-bold">URL Destino</label>
                <input 
                  type="url"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0f0c] text-white border border-[#1c1d1a] rounded-xl focus:border-[#94C700] outline-none transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#575855] uppercase tracking-wider font-bold">Alias Corto</label>
                <div className="flex rounded-xl bg-[#0e0f0c] border border-[#1c1d1a] focus-within:border-[#94C700] transition overflow-hidden">
                  <span className="px-3 py-2.5 text-xs text-[#575855] font-semibold border-r border-[#1c1d1a] select-none flex items-center">
                    rpj.es/
                  </span>
                  <input 
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="flex-grow px-3 py-2.5 bg-transparent text-white outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {editError && (
                <p className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{editError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="flex-1 py-2.5 bg-[#1c1d1a] border border-[#2b2d28] text-white font-semibold rounded-xl hover:bg-[#22231f] transition cursor-pointer"
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
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setDeletingId(null)}
        >
          <div 
            className="bg-[#121310] border border-[#1c1d1a] p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto text-red-400 mb-2">
              <Trash2 size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-white font-bold text-lg">¿Eliminar enlace?</h3>
              <p className="text-xs text-[#575855]">
                Esta acción eliminará de forma permanente el enlace corto <span className="text-white font-semibold font-mono">rpj.es/{deletingId}</span>. Los accesos existentes dejarán de funcionar.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-[#1c1d1a] border border-[#2b2d28] text-white font-semibold rounded-xl hover:bg-[#22231f] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
