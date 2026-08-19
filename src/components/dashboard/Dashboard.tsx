import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useUrlHistory } from '../../hooks/useUrlHistory';
import { useQrPreview } from '../../hooks/useQrPreview';
import { createShortLink, updateShortLink, deleteShortLink } from '../../lib/client/api';
import type { ShortUrl } from '../../types/url';
import DashboardHeader from './DashboardHeader';
import LinkForm from './LinkForm';
import QrCustomizer from './QrCustomizer';
import ResultCard from './ResultCard';
import LinksHistoryTable from './LinksHistoryTable';
import QrPreviewModal from './modals/QrPreviewModal';
import EditLinkModal from './modals/EditLinkModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const { urls, loading: loadingHistory, refresh: refreshHistory } = useUrlHistory();

  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // URL creation result state
  const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // QR Customization states (shared by the live result card and the lightbox)
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBgColor, setQrBgColor] = useState('#ffffff');
  const [includeLogo, setIncludeLogo] = useState(true);
  const qrOptions = { color: qrColor, bgColor: qrBgColor, includeLogo };

  const qrDataUrl = useQrPreview(result?.shortUrl ?? null, qrOptions);

  // Active QR preview modal
  const [selectedQr, setSelectedQr] = useState<{ url: string; slug: string } | null>(null);
  const modalQrDataUrl = useQrPreview(selectedQr?.url ?? null, qrOptions);

  // Edit Link Modal State
  const [editingUrl, setEditingUrl] = useState<ShortUrl | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Link Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      const data = await createShortLink(originalUrl, customSlug);
      const shortUrl = `${window.location.protocol}//${window.location.host}/${data.slug}`;

      setResult({ shortUrl, slug: data.slug });
      setOriginalUrl('');
      setCustomSlug('');
      refreshHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUrl) return;

    setEditLoading(true);
    setEditError('');

    try {
      await updateShortLink(editingUrl.id, editOriginalUrl, editSlug);
      setEditingUrl(null);
      refreshHistory();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    setDeleteLoading(true);

    try {
      await deleteShortLink(deletingId);

      if (result && result.slug === deletingId) {
        setResult(null);
      }

      setDeletingId(null);
      refreshHistory();
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

  const generateAndOpenQr = (slug: string) => {
    const shortUrl = `${window.location.protocol}//${window.location.host}/${slug}`;
    setSelectedQr({ url: shortUrl, slug });
  };

  const startEdit = (item: ShortUrl) => {
    setEditingUrl(item);
    setEditOriginalUrl(item.originalUrl);
    setEditSlug(item.id);
    setEditError('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      <DashboardHeader user={user} theme={theme} onToggleTheme={toggleTheme} />

      {/* Main Grid: Generator & Result & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 p-6 bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] rounded-2xl flex flex-col justify-between space-y-6 transition-colors duration-200">
          <LinkForm
            originalUrl={originalUrl}
            customSlug={customSlug}
            loading={loading}
            error={error}
            onOriginalUrlChange={setOriginalUrl}
            onCustomSlugChange={setCustomSlug}
            onSubmit={handleShorten}
          />
          <QrCustomizer
            qrColor={qrColor}
            qrBgColor={qrBgColor}
            includeLogo={includeLogo}
            onColorChange={setQrColor}
            onBgColorChange={setQrBgColor}
            onIncludeLogoChange={setIncludeLogo}
          />
        </section>

        <ResultCard result={result} qrDataUrl={qrDataUrl} copied={copied} onCopy={handleCopy} />
      </div>

      <LinksHistoryTable
        urls={urls}
        loading={loadingHistory}
        copiedSlug={copiedSlug}
        onCopy={handleCopy}
        onViewQr={generateAndOpenQr}
        onEdit={startEdit}
        onDelete={setDeletingId}
      />

      <QrPreviewModal
        selectedQr={selectedQr}
        qrDataUrl={modalQrDataUrl}
        onClose={() => setSelectedQr(null)}
        onCopy={handleCopy}
      />

      <EditLinkModal
        editingUrl={editingUrl}
        editOriginalUrl={editOriginalUrl}
        editSlug={editSlug}
        editLoading={editLoading}
        editError={editError}
        onOriginalUrlChange={setEditOriginalUrl}
        onSlugChange={setEditSlug}
        onSubmit={handleEditSubmit}
        onClose={() => setEditingUrl(null)}
      />

      <DeleteConfirmModal
        deletingId={deletingId}
        deleteLoading={deleteLoading}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
