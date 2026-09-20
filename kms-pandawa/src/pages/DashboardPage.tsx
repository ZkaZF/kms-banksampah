import React from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Badge } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah, formatNumber, formatRelativeTime, cn } from '../lib/utils';
import { 
  TrendingUp, 
  Package, 
  Users, 
  Wallet, 
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  ScanLine,
  MessageSquare,
  Weight,
} from 'lucide-react';

const statCards = [
  { key: 'totalTransaksiHariIni', label: 'Transaksi Hari Ini', icon: Package, color: 'bg-primary-600', bg: 'bg-primary-100', trend: '+12%', trendLabel: 'dari kemarin', positive: true },
  { key: 'totalBeratHariIni', label: 'Total Berat (kg)', icon: Weight, color: 'bg-emerald-600', bg: 'bg-emerald-100', trend: '+8%', trendLabel: 'dari kemarin', positive: true },
  { key: 'totalNilaiHariIni', label: 'Total Nilai', icon: Wallet, color: 'bg-teal-600', bg: 'bg-teal-100', trend: '+15%', trendLabel: 'dari kemarin', positive: true, isCurrency: true },
  { key: 'nasabahAktifHariIni', label: 'Nasabah Aktif', icon: Users, color: 'bg-green-600', bg: 'bg-green-100', trend: '+3', trendLabel: 'nasabah baru', positive: true },
];

export function DashboardPage() {
  const { stats, refreshStats, transaksiList, nasabahList } = useData();
  const { user } = useAuth();

  const recentTransaksi = transaksiList.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan operasional Bank Sampah Pandawa Berjaya hari ini"
        action={
          <button onClick={refreshStats} className="btn-secondary gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Refresh
          </button>
        }
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6" role="list" aria-label="Statistik utama">
        {statCards.map(card => {
          const value = stats[card.key as keyof typeof stats];
          const Icon = card.icon;
          return (
            <Card key={card.key} hover className="relative overflow-hidden" role="listitem">
              <div className={cn('absolute top-0 right-0 w-24 h-24 rounded-full opacity-10', card.bg)} aria-hidden="true" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary font-medium">{card.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    {card.isCurrency ? (
                          <span className="text-2xl sm:text-3xl font-bold text-text-primary tabular-nums">{formatRupiah(value as number)}</span>
                        ) : (
                          <span className="text-2xl sm:text-3xl font-bold text-text-primary tabular-nums">{formatNumber(value as number)}</span>
                        )}
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', card.positive ? 'bg-success/10 text-success' : 'bg-error/10 text-error')}>
                          {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {card.trend}
                        </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{card.trendLabel}</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.color)}>
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Transaksi Terbaru</h2>
            <a href="/transaksi" className="text-sm text-primary hover:underline font-medium">Lihat Semua</a>
          </div>
          <div className="table-container">
            <table className="table" role="table">
              <thead>
                <tr>
                  <th scope="col">Waktu</th>
                  <th scope="col">Nasabah</th>
                  <th scope="col" className="hidden md:table-cell">Item</th>
                  <th scope="col" className="text-right">Berat</th>
                  <th scope="col" className="text-right">Nilai</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                      Belum ada transaksi hari ini
                    </td>
                  </tr>
                ) : (
                  recentTransaksi.map(t => (
                    <tr key={t.id}>
                      <td className="text-sm text-text-secondary whitespace-nowrap">{formatRelativeTime(t.createdAt)}</td>
                      <td className="font-medium text-text-primary">{t.nasabahNama}</td>
                      <td className="hidden md:table-cell text-sm text-text-secondary">
                        {t.items.map(i => `${i.namaKategori} (${i.berat}kg)`).join(', ')}
                      </td>
                      <td className="text-right text-sm font-medium tabular-nums">{formatNumber(t.totalBerat)} kg</td>
                      <td className="text-right text-sm font-medium tabular-nums">{formatRupiah(t.totalNilai)}</td>
                      <td>
                        <Badge variant={t.status === 'synced' ? 'success' : t.status === 'pending' ? 'warning' : 'error'}>
                          {t.status === 'synced' ? 'Tersinkron' : t.status === 'pending' ? 'Menunggu' : 'Gagal'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Ringkasan Umum</h2>
          </div>
          <div className="space-y-4">
            <StatRow label="Total Nasabah" value={formatNumber(stats.totalNasabah)} icon={<Users className="w-5 h-5 text-primary" />} />
            <StatRow label="Total Saldo Nasabah" value={formatRupiah(stats.totalSaldoNasabah)} icon={<Wallet className="w-5 h-5 text-emerald-600" />} isCurrency />
            <StatRow label="Rata-rata Transaksi/Hari" value={`${(stats.totalTransaksiHariIni / Math.max(1, new Date().getDate())).toFixed(1)} transaksi`} icon={<TrendingUp className="w-5 h-5 text-teal-600" />} />
            <StatRow label="Total Berat Bulan Ini" value={`${(stats.totalBeratHariIni * 30).toFixed(1)} kg`} icon={<Weight className="w-5 h-5 text-green-600" />} />
          </div>
          
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="font-medium text-text-primary mb-3">Aksi Cepat</h3>
            <div className="grid gap-2">
              <a href="/scan" className="btn-primary w-full justify-start gap-2">
                <ScanLine className="w-4 h-4" aria-hidden="true" />
                Mode Scanner
              </a>
              <a href="/transaksi" className="btn-secondary w-full justify-start gap-2">
                <Package className="w-4 h-4" aria-hidden="true" />
                Transaksi Baru
              </a>
              <a href="/nasabah" className="btn-secondary w-full justify-start gap-2">
                <Users className="w-4 h-4" aria-hidden="true" />
                Kelola Nasabah
              </a>
              <a href="/katalog" className="btn-secondary w-full justify-start gap-2">
                <Download className="w-4 h-4" aria-hidden="true" />
                Update Harga
              </a>
              <a href="/sop" className="btn-secondary w-full justify-start gap-2">
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Kelola SOP
              </a>
              <a href="/broadcast" className="btn-secondary w-full justify-start gap-2">
                <MessageSquare className="w-4 h-4" aria-hidden="true" />
                Broadcast WA
              </a>
            </div>
          </div>
        </Card>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">Nasabah Saldo Tertinggi</h3>
            <div className="space-y-3">
              {nasabahList
                .sort((a, b) => b.saldo - a.saldo)
                .slice(0, 5)
                .map((n, i) => (
                  <div key={n.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{n.nama}</p>
                      <p className="text-xs text-text-muted">RT {n.rt}/RW {n.rw}</p>
                    </div>
                    <span className="font-semibold text-text-primary tabular-nums">{formatRupiah(n.saldo)}</span>
                  </div>
                ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-text-primary mb-4">Kategori Sampah Populer</h3>
            <div className="space-y-3">
              {['plastik', 'kertas', 'kardus', 'logam'].map(kat => {
                const count = transaksiList.filter(t => t.createdAt > new Date(Date.now() - 7*24*60*60*1000))
                  .flatMap(t => t.items)
                  .filter(i => i.kategori === kat).length;
                return (
                  <div key={kat} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{kat[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary capitalize">{kat}</p>
                      <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (count / Math.max(1, transaksiList.length)) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-text-primary tabular-nums">{count} transaksi</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

function StatRow({ label, value, icon, isCurrency }: { label: string; value: string; icon: React.ReactNode; isCurrency?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-elevated">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className={cn('font-medium text-text-primary', isCurrency && 'tabular-nums')}>{value}</p>
      </div>
    </div>
  );
}