import React, { useState } from 'react';
import { Card, Badge, Avatar, Button, Tabs, Tab, Modal } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah, formatDate, formatRelativeTime, formatNumber, cn } from '../lib/utils';
import { 
  CreditCard, 
  History, 
  BookOpen, 
  User, 
  RefreshCw,
  Download,
  Shield,
  ArrowRight,
  FileText,
  Bell
} from 'lucide-react';

export function NasabahPortalPage() {
  const { nasabahList, sopList, getTransaksiByNasabah, getSOPByKategori } = useData();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'saldo' | 'riwayat' | 'sop'>('saldo');
  const [refreshing, setRefreshing] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const nasabah = user ? nasabahList.find(n => n.nama === user.nama) : null;
  const riwayat = nasabah ? getTransaksiByNasabah(nasabah.id) : [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  if (!nasabah) {
    return (
      <>
        <div className="max-w-md mx-auto py-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto text-text-muted/50 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Portal Nasabah</h2>
          <p className="text-text-secondary mb-6">Silakan login sebagai nasabah untuk mengakses portal ini</p>
          <Button variant="secondary" onClick={logout} leftIcon={<ArrowRight className="w-4 h-4" />}>Kembali ke Login</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Portal Nasabah</h1>
              <p className="text-text-secondary">Halo, {nasabah.nama}! Kelola tabungan sampah Anda di sini.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const isDark = document.documentElement.classList.contains('dark');
                  if (isDark) {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                  } else {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                  }
                }}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors border border-transparent hover:border-border/50"
                title="Toggle theme"
              >
                <svg className="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg className="w-5 h-5 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
              <Button variant="secondary" size="sm" onClick={handleRefresh} loading={refreshing} leftIcon={<RefreshCw className="w-4 h-4" />} className="hidden sm:inline-flex">Refresh</Button>
              <Button variant="ghost" size="sm" onClick={() => setLogoutModalOpen(true)} leftIcon={<User className="w-4 h-4" />}>Keluar</Button>
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
                  <Badge variant="success" className="gap-1"><Shield className="w-3 h-3" /> Data Teramankan</Badge>
                  <Badge variant="info" className="gap-1"><Bell className="w-3 h-3" /> Notif WA Aktif</Badge>
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
                  <StatBox label="Total Nilai" value={formatRupiah(riwayat.reduce((s, t) => s + t.totalNilai, 0))} icon={<Wallet className="w-5 h-5" />} color="bg-amber-500" isCurrency />
                  <StatBox label="Rata-rata/Transaksi" value={formatRupiah(riwayat.length > 0 ? riwayat.reduce((s, t) => s + t.totalNilai, 0) / riwayat.length : 0)} icon={<TrendingUp className="w-5 h-5" />} color="bg-purple-500" isCurrency />
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
      </div>

      <Modal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Keluar & Evaluasi" size="md">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Terima kasih telah menggunakan/mencoba KMS Pandawa Berjaya! Sebelum Anda keluar, mohon kesediaannya untuk mengisi survei evaluasi singkat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => {
                window.open('https://docs.google.com/forms/d/e/1FAIpQLScx77tgx-dwE7cXjmnBP2nS1OPHNlufZ3qytmRNr0fUDLVIWw/viewform?usp=dialog', '_blank');
                setLogoutModalOpen(false);
                logout();
              }}
              className="flex-1"
              variant="primary"
            >
              Isi Survei GForm
            </Button>
            <Button
              onClick={() => {
                setLogoutModalOpen(false);
                logout();
              }}
              variant="ghost"
              className="sm:w-auto"
            >
              Lewati & Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function StatBox({ label, value, unit, icon, color, isCurrency }: { 
  label: string; 
  value: string | number; 
  unit?: string; 
  icon: React.ReactNode; 
  color: string; 
  isCurrency?: boolean;
}) {
  return (
    <div className="p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className={cn('font-bold text-text-primary mt-1', isCurrency && 'tabular-nums')}>
        {value}{unit && <span className="text-sm font-normal text-text-muted ml-1">{unit}</span>}
      </p>
    </div>
  );
}

const KATEGORI_SOP = [
  { value: 'plastik', label: 'Plastik', icon: '🥤' },
  { value: 'kertas', label: 'Kertas', icon: '📄' },
  { value: 'kardus', label: 'Kardus', icon: '📦' },
  { value: 'logam', label: 'Logam', icon: '♻️' },
  { value: 'umum', label: 'Umum', icon: '📋' },
];

import { Package, TrendingUp, Wallet } from 'lucide-react';