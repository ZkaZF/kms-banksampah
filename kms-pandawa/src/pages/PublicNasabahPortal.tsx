import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Avatar, Button, Tabs, Tab, Modal } from '../components/ui';
import { useData } from '../hooks/useData';
import { formatRupiah, formatDate, formatRelativeTime, formatNumber, generateQRCode } from '../lib/utils';
import { 
  CreditCard, 
  History, 
  BookOpen, 
  RefreshCw,
  Download,
  Shield,
  ArrowRight,
  FileText,
  Bell,
  Share2,
  QrCode,
  CheckCircle,
  Copy,
  Package,
  Wallet,
  TrendingUp
} from 'lucide-react';

const KATEGORI_SOP = [
  { value: 'plastik', label: 'Plastik', icon: '🥤' },
  { value: 'kertas', label: 'Kertas', icon: '📄' },
  { value: 'kardus', label: 'Kardus', icon: '📦' },
  { value: 'logam', label: 'Logam', icon: '♻️' },
  { value: 'umum', label: 'Umum', icon: '📋' },
];

export function PublicNasabahPortal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { nasabahList, sopList, getTransaksiByNasabah, getSOPByKategori } = useData();

  const [activeTab, setActiveTab] = useState<'saldo' | 'riwayat' | 'sop'>('saldo');
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const nasabah = useMemo(() => nasabahList.find(n => n.id === id), [nasabahList, id]);
  const riwayat = useMemo(() => nasabah ? getTransaksiByNasabah(nasabah.id) : [], [nasabah, getTransaksiByNasabah]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Portal Nasabah - ${nasabah?.nama}`,
          text: `Cek saldo tabungan sampah ${nasabah?.nama} di Bank Sampah Pandawa Berjaya`,
          url,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await copyToClipboard(url);
        }
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!nasabah) {
    return (
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <CreditCard className="w-16 h-16 mx-auto text-text-muted/50 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Portal Tidak Ditemukan</h2>
          <p className="text-text-secondary mb-6">Link portal nasabah tidak valid atau nasabah tidak terdaftar.</p>
          <Button variant="secondary" onClick={() => navigate('/login')} leftIcon={<ArrowRight className="w-4 h-4" />}>
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  const portalUrl = window.location.origin + '/portal/' + nasabah.id;

  return (
    <div className="min-h-screen bg-surface-elevated">
      <header className="sticky top-0 z-30 h-16 bg-surface/95 backdrop-blur-sm border-b border-border flex items-center px-4">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-text-primary">Bank Sampah Pandawa Berjaya</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1"><Shield className="w-3 h-3" /> Data Teramankan</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-20">
        <div className="mb-6 animate-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Portal Nasabah</h1>
              <p className="text-text-secondary">Halo, {nasabah.nama}! Kelola tabungan sampah Anda di sini.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleRefresh} loading={refreshing} leftIcon={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
              <Button variant="ghost" size="sm" onClick={handleShare} leftIcon={<Share2 className="w-4 h-4" />}>Bagikan</Button>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-emerald-5/50 border-primary/20">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar name={nasabah.nama} size="xl" className="bg-primary/10" />
                  <div>
                    <p className="text-sm text-text-secondary">Saldo Tabungan Sampah</p>
                    <p className="text-4xl font-bold text-primary tabular-nums">{formatRupiah(nasabah.saldo)}</p>
                    <p className="text-xs text-text-muted mt-1">ID: {nasabah.id} • RT {nasabah.rt}/RW {nasabah.rw} • Bergabung {formatDate(nasabah.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info" className="gap-1"><Bell className="w-3 h-3" /> Notif WA Aktif</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setShowQR(true)} leftIcon={<QrCode className="w-4 h-4" />}>QR Portal</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} onChange={(v) => setActiveTab(v as 'saldo' | 'riwayat' | 'sop')}>
          <Tab value="saldo" isActive={activeTab === 'saldo'} onClick={() => setActiveTab('saldo')}>
            <CreditCard className="w-4 h-4 mr-2" />
            Saldo & Ringkasan
          </Tab>
          <Tab value="riwayat" isActive={activeTab === 'riwayat'} onClick={() => setActiveTab('riwayat')}>
            <History className="w-4 h-4 mr-2" />
            Riwayat Transaksi
          </Tab>
          <Tab value="sop" isActive={activeTab === 'sop'} onClick={() => setActiveTab('sop')}>
            <BookOpen className="w-4 h-4 mr-2" />
            Panduan Pemilahan
          </Tab>
        </Tabs>

        <div className="mt-6 animate-in">
          {activeTab === 'saldo' && (
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold text-text-primary mb-4">Ringkasan Akun</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatBox label="Total Setoran" value={riwayat.length} unit="kali" icon={<History className="w-5 h-5" />} color="bg-blue-500" />
                  <StatBox label="Total Berat" value={formatNumber(riwayat.reduce((s, t) => s + t.totalBerat, 0))} unit="kg" icon={<Package className="w-5 h-5" />} color="bg-emerald-500" />
                  <StatBox label="Total Nilai" value={formatRupiah(riwayat.reduce((s, t) => s + t.totalNilai, 0))} icon={<Wallet className="w-5 h-5" />} color="bg-amber-500" />
                  <StatBox label="Rata-rata/Transaksi" value={formatRupiah(riwayat.length > 0 ? riwayat.reduce((s, t) => s + t.totalNilai, 0) / riwayat.length : 0)} icon={<TrendingUp className="w-5 h-5" />} color="bg-purple-500" />
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-text-primary mb-4">Kategori Sampah yang Disetor</h3>
                <div className="space-y-3">
                  {['plastik', 'kertas', 'kardus', 'logam'].map(kat => {
                    const items = riwayat.flatMap(t => t.items).filter(i => i.kategori === kat);
                    const totalBerat = items.reduce((s, i) => s + i.berat, 0);
                    const totalNilai = items.reduce((s, i) => s + i.subtotal, 0);
                    const count = items.length;
                    if (count === 0) return null;
                    return (
                      <div key={kat} className="flex items-center gap-4 p-3 bg-surface-elevated/50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-lg">{kat === 'plastik' ? '🥤' : kat === 'kertas' ? '📄' : kat === 'kardus' ? '📦' : '♻️'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-text-primary capitalize">{kat}</p>
                          <p className="text-sm text-text-secondary">{count} transaksi • {formatNumber(totalBerat)} kg</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-primary">{formatRupiah(totalNilai)}</p>
                          <p className="text-xs text-text-muted">{formatNumber(totalBerat)} kg</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-text-primary mb-4">Akses Cepat</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => setShowQR(true)} leftIcon={<QrCode className="w-4 h-4" />}>
                    Lihat QR Code Portal
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2" onClick={handleShare} leftIcon={<Share2 className="w-4 h-4" />}>
                    Bagikan Link Portal
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => setActiveTab('riwayat')} leftIcon={<History className="w-4 h-4" />}>
                    Lihat Riwayat Lengkap
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => setActiveTab('sop')} leftIcon={<BookOpen className="w-4 h-4" />}>
                    Baca Panduan Pemilahan
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'riwayat' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-primary">Riwayat Transaksi ({riwayat.length})</h3>
                <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>Export PDF</Button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Item Sampah</th>
                      <th className="text-right">Berat</th>
                      <th className="text-right">Nilai</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayat.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <History className="w-12 h-12 mx-auto text-text-muted/50 mb-3" />
                          <p className="text-text-secondary">Belum ada riwayat transaksi</p>
                          <p className="text-sm text-text-muted">Mulai setor sampah untuk melihat riwayat di sini</p>
                        </td>
                      </tr>
                    ) : (
                      riwayat.map(t => (
                        <tr key={t.id}>
                          <td className="text-sm whitespace-nowrap">{formatDate(t.createdAt)}</td>
                          <td className="max-w-xs truncate">{t.items.map(i => `${i.namaKategori} (${i.berat}kg)`).join(', ')}</td>
                          <td className="text-right tabular-nums">{formatNumber(t.totalBerat)} kg</td>
                          <td className="text-right tabular-nums font-medium">{formatRupiah(t.totalNilai)}</td>
                          <td><Badge variant={t.status === 'synced' ? 'success' : 'warning'}>{t.status === 'synced' ? 'Tersinkron' : 'Menunggu'}</Badge></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {activeTab === 'sop' && (
            <div className="space-y-6">
              {KATEGORI_SOP.filter(k => k.value !== 'umum').map(kat => {
                const sops = getSOPByKategori(kat.value as any);
                if (sops.length === 0) return null;
                return (
                  <Card key={kat.value}>
                    <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <span className="text-lg">{kat.icon}</span>
                      Panduan {kat.label}
                    </h3>
                    <div className="space-y-2">
                      {sops.map(sop => (
                        <button
                          key={sop.id}
                          className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors flex items-start gap-3"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary">{sop.judul}</p>
                            <p className="text-sm text-text-secondary line-clamp-2 mt-0.5">{sop.deskripsi}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="neutral" className="text-xs">v{sop.versi}</Badge>
                              <span className="text-xs text-text-muted">{formatRelativeTime(sop.updatedAt)}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </Card>
                );
              })}

              {sopList.filter(s => s.kategori === 'umum').length > 0 && (
                <Card>
                  <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    Panduan Umum
                  </h3>
                  <div className="space-y-2">
                    {sopList.filter(s => s.kategori === 'umum').map(sop => (
                      <button
                        key={sop.id}
                        className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors flex items-start gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary">{sop.judul}</p>
                          <p className="text-sm text-text-secondary line-clamp-2 mt-0.5">{sop.deskripsi}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="neutral" className="text-xs">v{sop.versi}</Badge>
                            <span className="text-xs text-text-muted">{formatRelativeTime(sop.updatedAt)}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* QR Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="QR Code Portal Nasabah" size="sm">
        <div className="text-center py-4">
          <div className="w-48 h-48 mx-auto mb-4 rounded-lg bg-white p-4 border border-border">
            <img 
              src={generateQRCode(portalUrl)} 
              alt={`QR Code Portal ${nasabah.nama}`}
              className="w-full h-full"
            />
          </div>
          <p className="text-sm text-text-secondary mb-2">Scan untuk buka portal ini</p>
          <p className="text-xs text-text-muted mb-4 font-mono break-all">{portalUrl}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleShare} className="flex-1" leftIcon={<Share2 className="w-4 h-4" />}>Bagikan</Button>
            <Button variant="primary" onClick={() => copyToClipboard(portalUrl)} className="flex-1" leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>{copied ? 'Tersalin!' : 'Salin Link'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatBox({ label, value, unit, icon, color }: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  icon: React.ReactNode; 
  color: string; 
}) {
  return (
    <div className="p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color.replace('bg-', '').replace('-500', '-100'), color: color.replace('bg-', '').replace('-500', '-700') }}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="font-bold text-text-primary mt-1 tabular-nums">
        {value}{unit && <span className="text-sm font-normal text-text-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
}