import React, { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Badge, Modal, Input, Select, Button, Textarea } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRelativeTime, cn } from '../lib/utils';
import type { SOP } from '../types';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const KATEGORI_SOP = [
  { value: 'plastik', label: 'Plastik', icon: '🥤' },
  { value: 'kertas', label: 'Kertas', icon: '📄' },
  { value: 'kardus', label: 'Kardus', icon: '📦' },
  { value: 'logam', label: 'Logam', icon: '♻️' },
  { value: 'umum', label: 'Umum', icon: '📋' },
];

export function SopPage() {
  const { sopList, addSOP, updateSOP, deleteSOP } = useData();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<'all' | string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSOP, setEditingSOP] = useState<typeof sopList[0] | null>(null);
  const [viewingSOP, setViewingSOP] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const filteredSOP = sopList
    .filter(s => {
      if (filterKategori !== 'all' && s.kategori !== filterKategori) return false;
      if (searchQuery && !s.judul.toLowerCase().includes(searchQuery.toLowerCase()) && !s.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSOP) return;
    const data = {
      kategori: editingSOP.kategori,
      judul: editingSOP.judul,
      deskripsi: editingSOP.deskripsi,
      gambarUrl: editingSOP.gambarUrl,
      versi: editingSOP.versi,
      aktif: editingSOP.aktif,
      tags: editingSOP.tags,
    };
    if (editingSOP.id) {
      await updateSOP(editingSOP.id, { ...data, versi: data.versi + 1 });
    } else {
      await addSOP({ ...data, versi: 1, createdBy: user?.uid || 'admin' });
    }
    setShowModal(false);
    setEditingSOP(null);
  };

  const openEdit = (sop: typeof sopList[0]) => {
    setEditingSOP({ ...sop });
    setShowModal(true);
  };

  const openDelete = (id: string) => setDeleteConfirm(id);
  const confirmDelete = async () => { if (deleteConfirm) { await deleteSOP(deleteConfirm); setDeleteConfirm(null); } };

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <PageHeader
        title="SOP Digital & Panduan Pemilahan"
        subtitle="Dokumentasikan dan bagikan pengetahuan pemilahan sampah ke seluruh pengurus & relawan"
        action={
          <Button onClick={() => { setEditingSOP({ id: '', kategori: 'plastik', judul: '', deskripsi: '', gambarUrl: '', versi: 1, aktif: true, tags: [], createdBy: user?.uid || 'admin', createdAt: new Date(), updatedAt: new Date() }); setShowModal(true); }} leftIcon={<Plus className="w-4 h-4" />}>
            Tambah SOP Baru
          </Button>
        }
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'SOP Digital' }]}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari judul, deskripsi, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
          options={[{ value: 'all', label: 'Semua Kategori' }, ...KATEGORI_SOP.map(k => ({ value: k.value, label: k.label }))]}
          className="w-full sm:w-48"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSOP.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-text-muted/50 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-text-secondary mb-1">Belum ada SOP terdokumentasi</h3>
            <p className="text-text-muted mb-4">Mulai buat SOP pertama untuk menjaga pengetahuan organisasi</p>
            <Button onClick={() => { setEditingSOP({ id: '', kategori: 'plastik', judul: '', deskripsi: '', gambarUrl: '', versi: 1, aktif: true, tags: [], createdBy: user?.uid || 'admin', createdAt: new Date(), updatedAt: new Date() }); setShowModal(true); }} leftIcon={<Plus className="w-4 h-4" />}>
              Buat SOP Pertama
            </Button>
          </div>
        ) : (
          filteredSOP.map(sop => {
            const katConfig = KATEGORI_SOP.find(k => k.value === sop.kategori);
            const isExpanded = expandedCards.has(sop.id);
            return (
              <Card key={sop.id} className={cn('overflow-hidden transition-all duration-200', isExpanded && 'shadow-lg')}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" className="gap-1">
                        <span>{katConfig?.icon}</span>
                        <span className="capitalize">{sop.kategori}</span>
                      </Badge>
                      <Badge variant={sop.aktif ? 'success' : 'neutral'} className="text-xs">
                        {sop.aktif ? 'Aktif' : 'Arsip'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewingSOP(sop.id)} className="p-1.5" aria-label="Lihat detail">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(sop)} className="p-1.5" aria-label="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDelete(sop.id)} className="p-1.5 text-error hover:text-error" aria-label="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-text-primary mb-2 line-clamp-2">{sop.judul}</h3>
                  
                  <div className={cn('text-sm text-text-secondary prose prose-sm max-w-none', !isExpanded && 'line-clamp-3')}>
                    {sop.deskripsi}
                  </div>

                  {sop.tags && sop.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {sop.tags.map(tag => (
                        <Badge key={tag} variant="neutral" className="text-xs px-2 py-0.5">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-text-muted">
                    <span>v{sop.versi} • {formatRelativeTime(sop.updatedAt)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExpand(sop.id)} 
                      className="p-1 h-6 gap-1 text-text-muted hover:text-primary"
                      aria-expanded={isExpanded}
                      aria-controls={`sop-content-${sop.id}`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? 'Tutup' : 'Baca selengkapnya'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingSOP(null); }} title={editingSOP?.id ? 'Edit SOP' : 'Tambah SOP Baru'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Kategori"
              name="kategori"
              value={editingSOP?.kategori || 'plastik'}
              onChange={e => setEditingSOP(prev => prev ? { ...prev, kategori: e.target.value as SOP['kategori'] } : null)}
              options={KATEGORI_SOP.map(k => ({ value: k.value, label: k.label }))}
              required
            />
            <Input label="Versi" type="number" name="versi" value={editingSOP?.versi || 1} onChange={e => setEditingSOP(prev => prev ? { ...prev, versi: parseInt(e.target.value) || 1 } : null)} min="1" />
          </div>
          <Input label="Judul SOP" name="judul" value={editingSOP?.judul || ''} onChange={e => setEditingSOP(prev => prev ? { ...prev, judul: e.target.value } : null)} required placeholder="Contoh: Kriteria PET Bottle Grade A" />
          <Textarea label="Deskripsi Lengkap" name="deskripsi" value={editingSOP?.deskripsi || ''} onChange={e => setEditingSOP(prev => prev ? { ...prev, deskripsi: e.target.value } : null)} required placeholder="Tuliskan prosedur lengkap, kriteria, larangan, tips..." rows={6} />
          <Input label="URL Gambar (Opsional)" name="gambarUrl" value={editingSOP?.gambarUrl || ''} onChange={e => setEditingSOP(prev => prev ? { ...prev, gambarUrl: e.target.value } : null)} placeholder="https://example.com/gambar.jpg" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editingSOP?.aktif} onChange={e => setEditingSOP(prev => prev ? { ...prev, aktif: e.target.checked } : null)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              <span className="text-sm text-text-primary">Aktif (tampil untuk relawan/nasabah)</span>
            </label>
          </div>
          <Input label="Tags (pisahkan dengan koma)" name="tags" value={editingSOP?.tags?.join(', ') || ''} onChange={e => setEditingSOP(prev => prev ? { ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : null)} placeholder="Contoh: PET, Grade A, Plastik, Kriteria" />
          <div className="flex gap-3 pt-2 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => { setShowModal(false); setEditingSOP(null); }} className="flex-1">Batal</Button>
            <Button type="submit" className="flex-1">{editingSOP?.id ? 'Simpan Perubahan' : 'Tambah SOP'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewingSOP} onClose={() => setViewingSOP(null)} title="Detail SOP" size="xl">
        {viewingSOP && (() => {
          const sop = sopList.find(s => s.id === viewingSOP);
          if (!sop) return null;
          const katConfig = KATEGORI_SOP.find(k => k.value === sop.kategori);
          return (
            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start gap-4 p-4 bg-surface-elevated rounded-lg">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">{katConfig?.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="neutral" className="gap-1"><span>{katConfig?.icon}</span><span className="capitalize">{sop.kategori}</span></Badge>
                    <Badge variant={sop.aktif ? 'success' : 'neutral'}>{sop.aktif ? 'Aktif' : 'Arsip'}</Badge>
                    <Badge variant="info">v{sop.versi}</Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary mb-1">{sop.judul}</h2>
                  <p className="text-sm text-text-secondary">Diupdate: {formatRelativeTime(sop.updatedAt)} • Oleh: {sop.createdBy}</p>
                </div>
              </div>

              {sop.gambarUrl && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={sop.gambarUrl} alt={sop.judul} className="w-full h-auto max-h-96 object-cover" />
                </div>
              )}

              <div className="prose prose-sm max-w-none text-text-secondary">
                {sop.deskripsi.split('\n').map((line, i) => (
                  <p key={i} className="whitespace-pre-wrap">{line}</p>
                ))}
              </div>

              {sop.tags && sop.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {sop.tags.map(tag => (
                    <Badge key={tag} variant="neutral" className="gap-1"><Tag className="w-3 h-3" />{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus SOP" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Hapus SOP?</h3>
          <p className="text-text-secondary mb-4">SOP ini akan dihapus permanen. Riwayat versi tidak bisa dipulihkan.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Batal</Button>
            <Button variant="danger" onClick={confirmDelete} className="flex-1">Hapus</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}