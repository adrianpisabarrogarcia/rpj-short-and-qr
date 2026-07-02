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
  Edit2,
  Sliders,
  Sun,
  Moon
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
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // URL creation result state
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // History URLs
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  
  // QR Customization states (for the live result card and lightbox)
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Active QR preview modal
  const [selectedQr, setSelectedQr] = useState<{ url: string; slug: string } | null>(null);
  const [modalQrDataUrl, setModalQrDataUrl] = useState('');

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
    // Read theme preference on mount
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (preferDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  // Re-generate QR when customization parameters or active result changes
  useEffect(() => {
    if (result) {
      generateQr(result.shortUrl, false);
    }
  }, [result, qrColor, qrBgColor, includeLogo]);

  // Re-generate modal QR when parameters or active modal changes
  useEffect(() => {
    if (selectedQr) {
      generateQr(selectedQr.url, true);
    }
  }, [selectedQr, qrColor, qrBgColor, includeLogo]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

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

  // Helper to render QR Code into canvas and apply logo overlay
  const generateQr = async (text: string, isModal = false) => {
    try {
      const size = 600;
      const tempCanvas = document.createElement('canvas');
      
      await QRCode.toCanvas(tempCanvas, text, {
        width: size,
        margin: 2,
        errorCorrectionLevel: 'H', // High error correction to support logo overlay
        color: {
          dark: qrColor,
          light: qrBgColor,
        },
      });

      const ctx = tempCanvas.getContext('2d');
      if (ctx && includeLogo) {
        const logoSize = size * 0.22;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;

        // Draw background card for logo
        ctx.fillStyle = qrBgColor === '#ffffff00' ? '#ffffff' : qrBgColor;
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

      const dataUrl = tempCanvas.toDataURL('image/png');
      if (isModal) {
        setModalQrDataUrl(dataUrl);
      } else {
        setQrDataUrl(dataUrl);
      }
    } catch (err) {
      console.error('Error generating QR Canvas', err);
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

      setResult({
        shortUrl,
        slug: data.slug,
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
    setSelectedQr({ url: shortUrl, slug });
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
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl transition-colors duration-200">
        <div className="flex items-center gap-3">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border-2 border-[#94C700]" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#edf0e8] dark:bg-[#1c1d1a] flex items-center justify-center border border-[#94C700]/30">
              <User className="text-[#94C700]" />
            </div>
          )}
          <div>
            <h2 className="text-[#1c1d1a] dark:text-white font-bold text-lg flex items-center gap-2">
              Hola, {user.name} <Sparkles size={16} className="text-[#94C700] animate-pulse" />
            </h2>
            <p className="text-[#6d7067] dark:text-[#575855] text-xs font-mono">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme switcher button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-[#f5f7f2] dark:bg-[#1c1d1a] hover:bg-[#edf0e8] dark:hover:bg-[#22231f] text-[#6d7067] dark:text-[#d4d8cc] border border-[#edf0e8] dark:border-[#2b2d28] rounded-xl cursor-pointer transition"
            title="Cambiar tema de la interfaz"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-indigo-600" />}
          </button>

          <a 
            href="/api/auth/logout" 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 dark:text-red-400 border border-red-500/20 hover:bg-red-500/10 cursor-pointer transition"
          >
            <LogOut size={16} /> Cerrar Sesión
          </a>
        </div>
      </header>

      {/* Main Grid: Generator & Result & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Generator Panel */}
        <section className="lg:col-span-2 p-6 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl flex flex-col justify-between space-y-6 transition-colors duration-200">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#94C700]/10 rounded-lg text-[#94C700]">
                <Link size={20} />
              </div>
              <h3 className="text-[#1c1d1a] dark:text-white text-lg font-bold">Acortador de Enlaces</h3>
            </div>
            
            <form onSubmit={handleShorten} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">URL Original</label>
                <input 
                  type="url" 
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
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
                    onChange={(e) => setCustomSlug(e.target.value)}
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

          {/* QR Code Realtime Customizer Panel */}
          <div className="pt-6 border-t border-[#edf0e8] dark:border-[#1c1d1a]/80 space-y-4">
            <div className="flex items-center gap-2 text-[#1c1d1a] dark:text-white font-bold text-sm">
              <Sliders size={16} className="text-[#94C700]" />
              <span>Personalizar Diseño del Código QR</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#1c1d1a] dark:text-[#d4d8cc]">
              {/* Foreground Color Picker */}
              <div className="space-y-1.5">
                <span className="text-[#6d7067] dark:text-[#575855] font-semibold uppercase tracking-wider block">Color de Módulos</span>
                <div className="flex gap-2">
                  {[
                    { hex: '#000000', label: 'Negro' },
                    { hex: '#94C700', label: 'Verde RPJ' },
                    { hex: '#80CAE3', label: 'Azul RPJ' },
                    { hex: '#3300C7', label: 'Azul Oscuro' }
                  ].map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setQrColor(color.hex)}
                      className={`w-6 h-6 rounded-full border cursor-pointer transition ${qrColor === color.hex ? 'border-neutral-500 dark:border-white scale-110 shadow-lg' : 'border-transparent'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color Picker */}
              <div className="space-y-1.5">
                <span className="text-[#6d7067] dark:text-[#575855] font-semibold uppercase tracking-wider block">Color de Fondo</span>
                <div className="flex gap-2">
                  {[
                    { hex: '#ffffff', label: 'Blanco' },
                    { hex: '#f7fbe6', label: 'Verde Claro' },
                    { hex: '#80cae3', label: 'Azul' },
                    { hex: '#ffffff00', label: 'Transparente' }
                  ].map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setQrBgColor(color.hex)}
                      className={`w-6 h-6 rounded-full border cursor-pointer transition ${qrBgColor === color.hex ? 'border-neutral-500 dark:border-white scale-110 shadow-lg' : 'border-neutral-300 dark:border-neutral-700/50'}`}
                      style={{ backgroundColor: color.hex === '#ffffff00' ? '#e2e8f0' : color.hex }}
                      title={color.label}
                    >
                      {color.hex === '#ffffff00' && <span className="text-[9px] text-[#6d7067] font-bold">X</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Logo Overlay Toggle */}
              <div className="space-y-1.5 flex flex-col justify-center">
                <span className="text-[#6d7067] dark:text-[#575855] font-semibold uppercase tracking-wider block mb-1">Branding Corporativo</span>
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#1c1d1a] dark:text-[#d4d8cc]">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#94C700] bg-white dark:bg-[#0e0f0c] border-[#edf0e8] dark:border-[#1c1d1a]"
                  />
                  <span className="text-xs">Incluir Logo RPJ al centro</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Card Result */}
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
                    onClick={() => handleCopy(result.shortUrl)}
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

      </div>

      {/* History Links List */}
      <section className="p-6 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl transition-colors duration-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-[#94C700]/10 rounded-lg text-[#94C700]">
            <Clock size={20} />
          </div>
          <h3 className="text-[#1c1d1a] dark:text-white text-lg font-bold">Mis Enlaces Recientes</h3>
        </div>

        {loadingHistory ? (
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
                            onClick={() => handleCopy(shortUrl, item.id)}
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
                            onClick={() => generateAndOpenQr(item.id)}
                            className="p-1.5 text-[#6d7067] dark:text-[#575855] hover:text-[#80CAE3] bg-[#ffffff] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition cursor-pointer"
                            title="Ver Código QR"
                          >
                            <QrCode size={14} />
                          </button>
                          <button 
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-[#6d7067] dark:text-[#575855] hover:text-[#94C700] bg-[#ffffff] dark:bg-[#0e0f0c] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-lg transition cursor-pointer"
                            title="Editar Enlace"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setDeletingId(item.id)}
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

      {/* QR Preview Lightbox Modal */}
      {selectedQr && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQr(null)}
        >
          <div 
            className="bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#1c1d1a] dark:text-white font-bold text-sm truncate font-mono">rpj.es/{selectedQr.slug}</span>
              <button 
                onClick={() => setSelectedQr(null)}
                className="text-[#6d7067] dark:text-[#575855] hover:text-black dark:hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
            
            <div className="bg-[#f5f7f2] dark:bg-[#1c1d1a]/50 p-4 rounded-xl inline-block border border-[#edf0e8] dark:border-[#1c1d1a] shadow-lg mx-auto">
              <div className="p-2 bg-white rounded-lg">
                {modalQrDataUrl ? (
                  <img src={modalQrDataUrl} alt="Código QR Grande Personalizado" className="w-56 h-56 mx-auto animate-fade-in" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-black text-xs font-mono">Generando...</div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleCopy(selectedQr.url)}
                className="flex-grow flex items-center justify-center gap-1.5 py-2 px-3 bg-[#edf0e8] dark:bg-[#1c1d1a] border border-[#edf0e8] dark:border-[#2b2d28] hover:text-black dark:hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Copiar Enlace
              </button>
              <a 
                href={modalQrDataUrl} 
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
            className="bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#1c1d1a] dark:text-white font-bold text-lg">Editar Enlace</h3>
            <p className="text-xs text-[#6d7067] dark:text-[#575855]">Modifica los parámetros de este enlace acortado. Los clics acumulados se conservarán.</p>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#6d7067] dark:text-[#575855] uppercase tracking-wider font-bold">URL Destino</label>
                <input 
                  type="url"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
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
                    onChange={(e) => setEditSlug(e.target.value)}
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
                  onClick={() => setEditingUrl(null)}
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
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={() => setDeletingId(null)}
        >
          <div 
            className="bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto text-red-500 dark:text-red-400 mb-2">
              <Trash2 size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-[#1c1d1a] dark:text-white font-bold text-lg">¿Eliminar enlace?</h3>
              <p className="text-xs text-[#6d7067] dark:text-[#575855]">
                Esta acción eliminará de forma permanente el enlace corto <span className="text-[#1c1d1a] dark:text-white font-semibold font-mono">rpj.es/{deletingId}</span>. Los accesos existentes dejarán de funcionar.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-[#edf0e8] dark:bg-[#1c1d1a] border border-[#edf0e8] dark:border-[#2b2d28] text-[#1c1d1a] dark:text-white font-semibold rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#22231f] transition cursor-pointer"
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
