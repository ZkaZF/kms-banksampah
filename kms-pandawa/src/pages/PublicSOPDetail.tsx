import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../components/ui';
import { useData } from '../hooks/useData';
import { formatRelativeTime, cn } from '../lib/utils';
import { 
  BookOpen, 
  ArrowLeft, 
  Share2, 
  Download,
  ExternalLink,
  CheckCircle,
  Shield,
  Clock,
  FileText,
  Tag,
  Eye,
} from 'lucide-react';

const KATEGORI_SOP = [
  { value: 'plastik', label: 'Plastik', icon: '🥤', color: 'bg-blue-100 text-blue-700' },
  { value: 'kertas', label: 'Kertas', icon: '📄', color: 'bg-amber-100 text-amber-700' },
  { value: 'kardus', label: 'Kardus', icon: '📦', color: 'bg-orange-100 text-orange-700' },
  { value: 'logam', label: 'Logam', icon: '♻️', color: 'bg-gray-100 text-gray-700' },
  { value: 'umum', label: 'Umum', icon: '📋', color: 'bg-purple-100 text-purple-700' },
];

export function PublicSOPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sopList } = useData();

  const sop = useMemo(() => sopList.find(s => s.id === id), [sopList, id]);
  const katConfig = useMemo(() => KATEGORI_SOP.find(k => k.value === sop?.kategori), [sop]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: sop?.judul || 'SOP Bank Sampah Pandawa',
          text: `Baca panduan: ${sop?.judul}`,
          url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await navigator.clipboard.writeText(url);
          alert('Link disalin ke clipboard');
        }
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link disalin ke clipboard');
    }
  };

  if (!sop) {
    return (
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <BookOpen className="w-16 h-16 mx-auto text-text-muted/50 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">SOP Tidak Ditemukan</h2>
          <p className="text-text-secondary mb-6">SOP yang Anda cari tidak tersedia atau telah diarsipkan.</p>
          <Button variant="secondary" onClick={() => navigate('/login')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-elevated">
      <header className="sticky top-0 z-30 h-16 bg-surface/95 backdrop-blur-sm border-b border-border flex items-center px-4">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />} className="gap-1">
            Kembali
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1"><Shield className="w-3 h-3" /> Resmi</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 pb-20">
        <div className="animate-in space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4 p-4 bg-surface-elevated/50 rounded-xl border border-border/50">
            <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl', katConfig?.color)}>
              {katConfig?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="neutral" className="gap-1"><span>{katConfig?.icon}</span><span className="capitalize">{sop.kategori}</span></Badge>
                <Badge variant={sop.aktif ? 'success' : 'neutral'}>{sop.aktif ? 'Aktif' : 'Arsip'}</Badge>
                <Badge variant="info">v{sop.versi}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">{sop.judul}</h1>
              <p className="text-sm text-text-secondary">Diupdate: {formatRelativeTime(sop.updatedAt)} • Oleh: {sop.createdBy}</p>
            </div>
          </div>

          {/* Image */}
          {sop.gambarUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={sop.gambarUrl} alt={sop.judul} className="w-full h-auto max-h-96 object-cover" />
            </div>
          )}

          {/* Content */}
          <Card className="prose prose-sm max-w-none">
            <div className="text-text-secondary whitespace-pre-wrap">
              {sop.deskripsi.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Card>

          {/* Tags */}
          {sop.tags && sop.tags.length > 0 && (
            <Card>
              <h3 className="font-semibold text-text-primary mb-3">Tag</h3>
              <div className="flex flex-wrap gap-2">
                {sop.tags.map(tag => (
                  <Badge key={tag} variant="neutral" className="gap-1"><Tag className="w-3 h-3" />{tag}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="bg-gradient-to-r from-primary/5 to-emerald-5/50 border-primary/20">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleShare} variant="secondary" className="flex-1 justify-center gap-2" leftIcon={<Share2 className="w-4 h-4" />}>
                Bagikan SOP
              </Button>
              <Button variant="secondary" className="flex-1 justify-center gap-2" leftIcon={<Download className="w-4 h-4" />}>
                Unduh PDF
              </Button>
              <Button variant="primary" className="flex-1 justify-center gap-2" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Buka di Aplikasi
              </Button>
            </div>
          </Card>

          {/* Info */}
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">Tentang SOP Ini</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem icon={<Eye className="w-5 h-5" />} label="Status" value={sop.aktif ? 'Aktif - Berlaku untuk operasional' : 'Arsip - Hanya untuk referensi'} color="text-success" />
              <InfoItem icon={<Clock className="w-5 h-5" />} label="Versi" value={`v${sop.versi} • ${formatRelativeTime(sop.updatedAt)}`} color="text-text-secondary" />
              <InfoItem icon={<CheckCircle className="w-5 h-5" />} label="Dibuat Oleh" value={sop.createdBy} color="text-text-secondary" />
              <InfoItem icon={<FileText className="w-5 h-5" />} label="Kategori" value={katConfig?.label || sop.kategori} color="text-text-secondary" />
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-text-muted border-t border-border pt-6">
            <p>Bank Sampah Pandawa Berjaya • RW 02 Banyumanik • Kota Semarang</p>
            <p className="mt-1">SOP ini merupakan dokumen resmi untuk menjaga kontinuitas pengetahuan organisasi</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-surface-elevated/50 rounded-lg border border-border/50">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color.replace('text-', 'bg-').replace('700', '100').replace('600', '100'))}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}