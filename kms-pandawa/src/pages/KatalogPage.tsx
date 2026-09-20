import React, { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Badge, Modal, Input, Select, Button } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah } from '../lib/utils';
import type { KatalogHarga } from '../types';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download,
  ArrowUp,
  ArrowDown,
  Minimize2
} from 'lucide-react';

const KATEGORI_LIST = [
  { value: 'plastik', label: 'Plastik', icon: '🥤' },
  { value: 'kertas', label: 'Kertas', icon: '📄' },
  { value: 'kardus', label: 'Kardus', icon: '📦' },
  { value: 'logam', label: 'Logam', icon: '♻️' },
  { value: 'lainnya', label: 'Lainnya', icon: '📦' },
];

const PENGEPUL_LIST = [
  'CV Berkah Jaya',
  'UD Kertas Mandiri',
  'Toko Logam Sejahtera',
  'CV Daur Ulang Makmur',
  'Lainnya...',
];

export function KatalogPage() {
  const { katalogList, addKatalog, updateKatalog, deleteKatalog } = useData();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<'all' | string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof katalogList[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'kategori', direction: 'asc' });

  const filteredKatalog = katalogList
    .filter(k => {
      if (filterKategori !== 'all' && k.kategori !== filterKategori) return false;
      if (searchQuery && !k.nama.toLowerCase().includes(searchQuery.toLowerCase()) && !k.pengepul?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key as keyof typeof a] as string | number;
      const bVal = b[sortConfig.key as keyof typeof b] as string | number;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const data = {
      nama: editingItem.nama,
      kategori: editingItem.kategori,
      hargaPerKg: editingItem.hargaPerKg,
      pengepul: editingItem.pengepul,
      satuan: editingItem.satuan,
      aktif: editingItem.aktif,
      catatan: editingItem.catatan,
    };
    if (editingItem.id) {
      await updateKatalog(editingItem.id, data);
    } else {
      await addKatalog({ ...data, updatedBy: user?.uid || 'admin' });
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const openEdit = (item: typeof katalogList[0]) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const openDelete = (id: string) => setDeleteConfirm(id);
  const confirmDelete = async () => { if (deleteConfirm) { await deleteKatalog(deleteConfirm); setDeleteConfirm(null); } };

  const sortIcon = (key: string) => {
    if (sortConfig.key !== key) return <Minimize2 className="w-4 h-4 text-text-muted" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-primary" /> : <ArrowDown className="w-4 h-4 text-primary" />;
  };

  return (
    <>
      <PageHeader
        title="Katalog Harga Jual ke Pengepul"
        subtitle="Kelola daftar harga sampah per kategori untuk referensi transaksi"
        action={
          <Button onClick={() => { setEditingItem({ id: '', nama: '', kategori: 'plastik', hargaPerKg: 0, pengepul: '', satuan: 'kg', aktif: true, catatan: '', updatedBy: user?.uid || 'admin', createdAt: new Date(), updatedAt: new Date() }); setShowModal(true); }} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah Harga
          </Button>
        }
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Katalog Harga' }]}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Cari nama item, pengepul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            options={[{ value: 'all', label: 'Semua Kategori' }, ...KATEGORI_LIST.map(k => ({ value: k.value, label: k.label }))]}
            className="w-full sm:w-48"
          />
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Export</Button>
        </div>

        <div className="table-container">
          <table className="table" role="table">
<thead>
                <tr>
                  <th scope="col" className="cursor-pointer hover:bg-surface-elevated" onClick={() => handleSort('kategori')}>
                    Kategori {sortIcon('kategori')}
                  </th>
                  <th scope="col" className="cursor-pointer hover:bg-surface-elevated" onClick={() => handleSort('nama')}>
                    Nama Item {sortIcon('nama')}
                  </th>
                  <th scope="col" className="cursor-pointer hover:bg-surface-elevated" onClick={() => handleSort('hargaPerKg')}>
                    Harga/Kg {sortIcon('hargaPerKg')}
                  </th>
                  <th scope="col" className="cursor-pointer hover:bg-surface-elevated" onClick={() => handleSort('pengepul')}>
                    Pengepul {sortIcon('pengepul')}
                  </th>
                  <th scope="col">Satuan</th>
                  <th scope="col">Status</th>
                  <th scope="col">Catatan</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
            <tbody>
              {filteredKatalog.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-muted">
                    <Package className="w-12 h-12 mx-auto text-text-muted/50 mb-3" aria-hidden="true" />
                    <p className="text-text-secondary">Belum ada data katalog harga</p>
                    <p className="text-sm text-text-muted">Tambah item harga pertama untuk memulai</p>
                  </td>
                </tr>
              ) : (
                filteredKatalog.map(item => {
                  const katConfig = KATEGORI_LIST.find(k => k.value === item.kategori);
                  return (
                    <tr key={item.id}>
                      <td>
                        <Badge variant="neutral" className="gap-1">
                          <span>{katConfig?.icon}</span>
                          <span className="capitalize">{item.kategori}</span>
                        </Badge>
                      </td>
                      <td className="font-medium text-text-primary">{item.nama}</td>
                      <td className="font-medium tabular-nums">{formatRupiah(item.hargaPerKg)}</td>
                      <td className="text-text-secondary">{item.pengepul || '-'}</td>
                      <td><Badge variant="neutral">{item.satuan}</Badge></td>
                      <td>
                        <Badge variant={item.aktif ? 'success' : 'neutral'}>
                          {item.aktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="text-text-muted text-sm max-w-xs truncate">{item.catatan || '-'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="p-1.5" aria-label="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(item.id)} className="p-1.5 text-error hover:text-error" aria-label="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingItem(null); }} title={editingItem?.id ? 'Edit Harga' : 'Tambah Harga Baru'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Item" name="nama" value={editingItem?.nama || ''} onChange={e => setEditingItem(prev => prev ? { ...prev, nama: e.target.value } : null)} required placeholder="Contoh: PET Bottle Grade A" />
          <Select
            label="Kategori"
            name="kategori"
            value={editingItem?.kategori || 'plastik'}
            onChange={e => setEditingItem(prev => prev ? { ...prev, kategori: e.target.value as KatalogHarga['kategori'] } : null)}
            options={KATEGORI_LIST.map(k => ({ value: k.value, label: k.label }))}
            required
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Harga per Kg (Rp)" type="number" name="hargaPerKg" value={editingItem?.hargaPerKg || 0} onChange={e => setEditingItem(prev => prev ? { ...prev, hargaPerKg: parseInt(e.target.value) || 0 } : null)} required min="0" step="100" />
            <Select
              label="Satuan"
              name="satuan"
              value={editingItem?.satuan || 'kg'}
              onChange={e => setEditingItem(prev => prev ? { ...prev, satuan: e.target.value as KatalogHarga['satuan'] } : null)}
              options={[{ value: 'kg', label: 'Kilogram (kg)' }, { value: 'pcs', label: 'Pieces (pcs)' }]}
            />
            <Input label="Pengepul" name="pengepul" value={editingItem?.pengepul || ''} onChange={e => setEditingItem(prev => prev ? { ...prev, pengepul: e.target.value } : null)} placeholder="Pilih atau ketik..." list="pengepul-list" />
          </div>
          <datalist id="pengepul-list">
            {PENGEPUL_LIST.map(p => <option key={p} value={p} />)}
          </datalist>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editingItem?.aktif} onChange={e => setEditingItem(prev => prev ? { ...prev, aktif: e.target.checked } : null)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-text-primary">Aktif (tampil di transaksi)</span>
            </label>
          </div>
          <Input label="Catatan" name="catatan" value={editingItem?.catatan || ''} onChange={e => setEditingItem(prev => prev ? { ...prev, catatan: e.target.value } : null)} placeholder="Catatan tambahan (opsional)" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setShowModal(false); setEditingItem(null); }} className="flex-1">Batal</Button>
            <Button type="submit" className="flex-1">{editingItem?.id ? 'Simpan Perubahan' : 'Tambah Harga'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Item Harga" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Hapus Item Harga?</h3>
          <p className="text-text-secondary mb-4">Item ini akan dihapus dari katalog dan tidak bisa dipilih saat transaksi.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Batal</Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">Hapus</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}