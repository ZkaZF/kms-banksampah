import React, { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Modal, Input, Button, Avatar, Dropdown } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah, formatDate, formatNumber, generateQRCode } from '../lib/utils';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Phone,
  QrCode,
  Printer,
  Copy,
  CheckCircle,
} from 'lucide-react';

export function NasabahPage() {
  const { nasabahList, addNasabah, updateNasabah, deleteNasabah, transaksiList } = useData();
  useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNasabah, setEditingNasabah] = useState<{ id?: string; nama: string; rt: string; rw: string; noWhatsApp: string } | null>(null);
  const [viewingNasabah, setViewingNasabah] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredNasabah = nasabahList.filter(n => 
    n.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.rt.includes(searchQuery) ||
    n.rw.includes(searchQuery)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNasabah) return;
    const data = { nama: editingNasabah.nama, rt: editingNasabah.rt, rw: editingNasabah.rw, noWhatsApp: editingNasabah.noWhatsApp };
    if (editingNasabah.id) {
      await updateNasabah(editingNasabah.id, data);
    } else {
      await addNasabah({ ...data, saldo: 0, qrCode: `N${String(nasabahList.length + 1).padStart(3, '0')}` });
    }
    setShowModal(false);
    setEditingNasabah(null);
  };

  const openEdit = (n: typeof nasabahList[0]) => {
    setEditingNasabah({ id: n.id, nama: n.nama, rt: n.rt, rw: n.rw, noWhatsApp: n.noWhatsApp || '' });
    setShowModal(true);
  };

  const openDelete = (id: string) => setDeleteConfirm(id);

  const openQR = (id: string) => {
    setShowQR(id);
    setCopied(false);
  };

  const handleCopyQR = async (id: string) => {
    const url = window.location.origin + '/portal/' + id;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteNasabah(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const getNasabahTransaksi = (nasabahId: string) => 
    transaksiList.filter(t => t.nasabahId === nasabahId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <>
      <PageHeader
        title="Kelola Nasabah"
        subtitle="Data nasabah Bank Sampah Pandawa Berjaya"
        action={
          <Button onClick={() => { setEditingNasabah(null); setShowModal(true); }} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Nasabah
          </Button>
        }
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Nasabah' }]}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Cari nasabah (nama, ID, RT/RW)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button>
          </div>
        </div>

        <div className="table-container">
          <table className="table" role="table">
            <thead>
              <tr>
                <th scope="col">Nasabah</th>
                <th scope="col">RT/RW</th>
                <th scope="col" className="hidden md:table-cell">Kontak</th>
                <th scope="col" className="text-right">Saldo</th>
                <th scope="col" className="hidden lg:table-cell">Transaksi</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredNasabah.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    <Users className="w-12 h-12 mx-auto text-text-muted/50 mb-3" aria-hidden="true" />
                    <p className="text-text-secondary">Belum ada nasabah terdaftar</p>
                    <p className="text-sm text-text-muted">Tambah nasabah pertama untuk memulai</p>
                  </td>
                </tr>
              ) : (
                filteredNasabah.map(n => {
                  const nasabahTransaksi = getNasabahTransaksi(n.id);
                  const totalSetoran = nasabahTransaksi.reduce((sum, t) => sum + t.totalNilai, 0);
                  return (
                    <tr key={n.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={n.nama} size="sm" />
                          <div>
                            <p className="font-medium text-text-primary">{n.nama}</p>
                            <p className="text-xs text-text-muted">ID: {n.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-text-secondary">RT {n.rt} / RW {n.rw}</td>
                      <td className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          {n.noWhatsApp && (
                            <a href={`https://wa.me/${n.noWhatsApp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-primary transition-colors">
                              <Phone className="w-4 h-4" aria-hidden="true" />
                              <span>{n.noWhatsApp}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="text-right font-semibold text-text-primary tabular-nums">{formatRupiah(n.saldo)}</td>
                      <td className="hidden lg:table-cell text-sm text-text-secondary">
                        {nasabahTransaksi.length} transaksi
                        {totalSetoran > 0 && <span className="ml-2 text-success">({formatRupiah(totalSetoran)})</span>}
                      </td>
                      <td>
                        <Dropdown
                          trigger={<Button variant="ghost" size="sm" className="p-1.5"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></Button>}
                          items={[
                            { label: 'Lihat Detail', icon: <Eye className="w-4 h-4" />, onClick: () => setViewingNasabah(n.id) },
                            { label: 'QR Code Portal', icon: <QrCode className="w-4 h-4" />, onClick: () => openQR(n.id) },
                            { label: 'Salin Link Portal', icon: <Copy className="w-4 h-4" />, onClick: () => handleCopyQR(n.id) },
                            { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => openEdit(n) },
                            { label: 'Hapus', icon: <Trash2 className="w-4 h-4" />, onClick: () => openDelete(n.id), danger: true },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>Menampilkan {filteredNasabah.length} dari {nasabahList.length} nasabah</span>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingNasabah(null); }} title={editingNasabah?.id ? 'Edit Nasabah' : 'Tambah Nasabah Baru'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Lengkap" name="nama" value={editingNasabah?.nama || ''} onChange={e => setEditingNasabah(prev => prev ? { ...prev, nama: e.target.value } : null)} required autoFocus />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="RT" name="rt" value={editingNasabah?.rt || ''} onChange={e => setEditingNasabah(prev => prev ? { ...prev, rt: e.target.value } : null)} required placeholder="02" />
            <Input label="RW" name="rw" value={editingNasabah?.rw || ''} onChange={e => setEditingNasabah(prev => prev ? { ...prev, rw: e.target.value } : null)} required placeholder="02" />
          </div>
          <Input label="No. WhatsApp" name="noWhatsApp" type="tel" value={editingNasabah?.noWhatsApp || ''} onChange={e => setEditingNasabah(prev => prev ? { ...prev, noWhatsApp: e.target.value } : null)} placeholder="08xxxxxxxxxx" helperText="Opsional, untuk notifikasi saldo" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setShowModal(false); setEditingNasabah(null); }} className="flex-1">Batal</Button>
            <Button type="submit" className="flex-1">{editingNasabah?.id ? 'Simpan Perubahan' : 'Tambah Nasabah'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewingNasabah} onClose={() => setViewingNasabah(null)} title="Detail Nasabah" size="lg">
        {viewingNasabah && (() => {
          const n = nasabahList.find(x => x.id === viewingNasabah);
          const t = getNasabahTransaksi(viewingNasabah);
          if (!n) return null;
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-surface-elevated rounded-lg">
                <Avatar name={n.nama} size="xl" />
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">{n.nama}</h3>
                  <p className="text-text-secondary">ID: {n.id} • RT {n.rt}/RW {n.rw} • Bergabung: {formatDate(n.createdAt)}</p>
                  {n.noWhatsApp && <p className="text-text-secondary flex items-center gap-1 mt-1"><Phone className="w-4 h-4" /> {n.noWhatsApp}</p>}
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-text-secondary">Saldo Tabungan</p>
                  <p className="text-3xl font-bold text-primary tabular-nums">{formatRupiah(n.saldo)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-primary mb-3">Riwayat Transaksi ({t.length})</h4>
                <div className="table-container max-h-64 overflow-y-auto">
                  <table className="table">
                    <thead><tr><th>Tanggal</th><th>Item</th><th className="text-right">Berat</th><th className="text-right">Nilai</th></tr></thead>
                    <tbody>
                      {t.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-text-muted">Belum ada transaksi</td></tr> : t.map(tr => (
                        <tr key={tr.id}>
                          <td className="text-sm">{formatDate(tr.createdAt)}</td>
                          <td className="text-sm">{tr.items.map(i => `${i.namaKategori} (${i.berat}kg)`).join(', ')}</td>
                          <td className="text-right text-sm font-medium">{formatNumber(tr.totalBerat)} kg</td>
                          <td className="text-right text-sm font-medium">{formatRupiah(tr.totalNilai)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={!!showQR} onClose={() => { setShowQR(null); setCopied(false); }} title="QR Code Portal Nasabah" size="sm">
        {showQR && (() => {
          const n = nasabahList.find(x => x.id === showQR);
          if (!n) return null;
          const portalUrl = window.location.origin + '/portal/' + n.id;
          return (
            <div className="text-center py-4">
              <div className="w-48 h-48 mx-auto mb-4 rounded-lg bg-white p-4 border border-border">
                <img 
                  src={generateQRCode(portalUrl)} 
                  alt={`QR Code Portal ${n.nama}`}
                  className="w-full h-full"
                />
              </div>
              <p className="text-sm text-text-secondary mb-2">Scan untuk buka portal {n.nama}</p>
              <p className="text-xs text-text-muted mb-4 font-mono break-all">{portalUrl}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => handleCopyQR(n.id)} className="flex-1" leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>{copied ? 'Tersalin!' : 'Salin Link'}</Button>
                <Button variant="primary" className="flex-1" leftIcon={<Printer className="w-4 h-4" />}>Cetak QR</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Nasabah" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Hapus Nasabah?</h3>
          <p className="text-text-secondary mb-4">Tindakan ini tidak bisa dibatalkan. Semua data transaksi nasabah ini akan ikut terhapus.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Batal</Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">Hapus Permanen</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}