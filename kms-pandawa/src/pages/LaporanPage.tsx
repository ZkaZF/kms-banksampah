import { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Select, Button, Badge, Input } from '../components/ui';
import { useData } from '../hooks/useData';
import { formatRupiah, formatDate, formatNumber, cn } from '../lib/utils';
import { 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  Users,
  Wallet
} from 'lucide-react';

export function LaporanPage() {
  const { transaksiList, katalogList } = useData();

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ 
    start: new Date(new Date().setDate(1)), 
    end: new Date() 
  });
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterPengepul, setFilterPengepul] = useState<string>('all');

  const filteredTransaksi = useMemo(() => {
    return transaksiList.filter(t => {
      const created = new Date(t.createdAt);
      if (dateRange.start && created < dateRange.start) return false;
      if (dateRange.end && created > new Date(dateRange.end.setHours(23,59,59))) return false;
      return true;
    });
  }, [transaksiList, dateRange]);

  const kategoriStats = useMemo(() => {
    const stats: Record<string, { berat: number; nilai: number; count: number }> = {};
    filteredTransaksi.forEach(t => {
      t.items.forEach(item => {
        if (!stats[item.kategori]) stats[item.kategori] = { berat: 0, nilai: 0, count: 0 };
        stats[item.kategori].berat += item.berat;
        stats[item.kategori].nilai += item.subtotal;
        stats[item.kategori].count += 1;
      });
    });
    return stats;
  }, [filteredTransaksi]);

  const pengepulStats = useMemo(() => {
    const stats: Record<string, { berat: number; nilai: number; count: number }> = {};
    filteredTransaksi.forEach(t => {
      t.items.forEach(item => {
        const katalog = katalogList.find(k => k.id === item.kategoriId);
        const pengepul = katalog?.pengepul || 'Tidak diketahui';
        if (!stats[pengepul]) stats[pengepul] = { berat: 0, nilai: 0, count: 0 };
        stats[pengepul].berat += item.berat;
        stats[pengepul].nilai += item.subtotal;
        stats[pengepul].count += 1;
      });
    });
    return stats;
  }, [filteredTransaksi, katalogList]);

  const totalBerat = filteredTransaksi.reduce((sum, t) => sum + t.totalBerat, 0);
  const totalNilai = filteredTransaksi.reduce((sum, t) => sum + t.totalNilai, 0);
  const totalTransaksi = filteredTransaksi.length;
  const nasabahAktif = new Set(filteredTransaksi.map(t => t.nasabahId)).size;

  const summaryCards = [
    { label: 'Total Transaksi', value: totalTransaksi, icon: TrendingUp, color: 'bg-blue-500', trend: '+12%' },
    { label: 'Total Berat (kg)', value: formatNumber(totalBerat), icon: Package, color: 'bg-emerald-500', trend: '+8%' },
    { label: 'Total Nilai', value: formatRupiah(totalNilai), icon: Wallet, color: 'bg-amber-500', trend: '+15%', isCurrency: true },
    { label: 'Nasabah Aktif', value: nasabahAktif, icon: Users, color: 'bg-purple-500', trend: '+3' },
  ];

  return (
    <>
      <PageHeader
        title="Laporan & Analisis"
        subtitle="Ringkasan performa pengelolaan sampah Bank Sampah Pandawa Berjaya"
        action={
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Export PDF
          </Button>
        }
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan' }]}
      />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-muted" />
            <Input
              type="date"
              value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
              onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
              className="w-40"
            />
            <span className="text-text-muted">s.d.</span>
            <Input
              type="date"
              value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
              onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
              className="w-40"
            />
          </div>
          <Select
            value={filterKategori}
            onChange={e => setFilterKategori(e.target.value)}
            options={[{ value: 'all', label: 'Semua Kategori' }, { value: 'plastik', label: 'Plastik' }, { value: 'kertas', label: 'Kertas' }, { value: 'kardus', label: 'Kardus' }, { value: 'logam', label: 'Logam' }]}
            className="w-full sm:w-48"
          />
          <Select
            value={filterPengepul}
            onChange={e => setFilterPengepul(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Pengepul' },
              ...Array.from(
                new Set(katalogList.map(k => k.pengepul).filter((p): p is string => Boolean(p)))
              ).map(p => ({ value: p, label: p })),
            ]}
            className="w-full sm:w-56"
          />
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {summaryCards.map(card => (
            <div key={card.label} className="p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">{card.label}</p>
                  <p className="text-2xl font-bold text-text-primary mt-1 tabular-nums">{card.value}</p>
                  <p className="text-xs text-success mt-1">{card.trend} vs periode sebelumnya</p>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.color)}>
                  <card.icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-text-primary mb-4">Per Kategori Sampah</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th className="text-right">Transaksi</th>
                  <th className="text-right">Total Berat (kg)</th>
                  <th className="text-right">Total Nilai</th>
                  <th className="text-right">Rata-rata/kg</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(kategoriStats).length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-text-muted">Tidak ada data</td></tr>
                ) : (
                  Object.entries(kategoriStats)
                    .sort(([,a], [,b]) => b.nilai - a.nilai)
                    .map(([kat, stat]) => (
                      <tr key={kat}>
                        <td className="capitalize font-medium">{kat}</td>
                        <td className="text-right tabular-nums">{stat.count}</td>
                        <td className="text-right tabular-nums">{formatNumber(stat.berat)}</td>
                        <td className="text-right tabular-nums font-medium">{formatRupiah(stat.nilai)}</td>
                        <td className="text-right tabular-nums text-text-secondary">{formatRupiah(stat.berat > 0 ? stat.nilai / stat.berat : 0)}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-text-primary mb-4">Per Pengepul</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Pengepul</th>
                  <th className="text-right">Item Dibeli</th>
                  <th className="text-right">Total Berat (kg)</th>
                  <th className="text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pengepulStats).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">Tidak ada data</td></tr>
                ) : (
                  Object.entries(pengepulStats)
                    .sort(([,a], [,b]) => b.nilai - a.nilai)
                    .map(([pengepul, stat]) => (
                      <tr key={pengepul}>
                        <td className="font-medium">{pengepul}</td>
                        <td className="text-right tabular-nums">{stat.count}</td>
                        <td className="text-right tabular-nums">{formatNumber(stat.berat)}</td>
                        <td className="text-right tabular-nums font-medium">{formatRupiah(stat.nilai)}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-text-primary mb-4">Detail Transaksi</h3>
        <div className="table-container max-h-96 overflow-y-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nasabah</th>
                <th>Petugas</th>
                <th>Item</th>
                <th className="text-right">Berat</th>
                <th className="text-right">Nilai</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksi.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-text-muted">Tidak ada transaksi di periode ini</td></tr>
              ) : (
                filteredTransaksi
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(t => (
                    <tr key={t.id}>
                      <td className="text-sm whitespace-nowrap">{formatDate(t.createdAt)}</td>
                      <td>{t.nasabahNama}</td>
                      <td className="text-sm text-text-secondary">{t.petugasNama}</td>
                      <td className="text-sm max-w-xs truncate">{t.items.map(i => `${i.namaKategori} (${i.berat}kg)`).join(', ')}</td>
                      <td className="text-right tabular-nums">{formatNumber(t.totalBerat)} kg</td>
                      <td className="text-right tabular-nums font-medium">{formatRupiah(t.totalNilai)}</td>
                      <td><Badge variant={t.status === 'synced' ? 'success' : t.status === 'pending' ? 'warning' : 'error'}>{t.status === 'synced' ? 'Tersinkron' : t.status === 'pending' ? 'Menunggu' : 'Gagal'}</Badge></td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}