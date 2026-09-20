import React, { useState } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Button, Input, Select, Card, Badge, Modal, Avatar, Alert } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah, formatNumber, KATEGORI_SAMPAH } from '../lib/utils';
import { 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  X, 
  Check, 
  Search, 
  ScanLine,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function TransaksiPage() {
  const { 
    nasabahList, 
    katalogList, 
    addTransaksi, 
    searchNasabah 
  } = useData();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNasabah, setSelectedNasabah] = useState<string | null>(null);
  const [items, setItems] = useState<Array<{
    id: string;
    kategoriId: string;
    kategori: string;
    namaKategori: string;
    berat: number;
    hargaPerKg: number;
  }>>([{ id: '1', kategoriId: '', kategori: '', namaKategori: '', berat: 0, hargaPerKg: 0 }]);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{ id: string; total: number } | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');

  const filteredNasabah = searchQuery ? searchNasabah(searchQuery) : nasabahList.slice(0, 10);

  const nasabah = selectedNasabah ? nasabahList.find(n => n.id === selectedNasabah) : null;

  const totalBerat = items.reduce((sum, item) => sum + item.berat, 0);
  const totalNilai = items.reduce((sum, item) => sum + (item.berat * item.hargaPerKg), 0);

  const handleKategoriChange = (index: string, kategoriId: string) => {
    const katalog = katalogList.find(k => k.id === kategoriId);
    setItems(prev => prev.map((item, i) => 
      i === parseInt(index) 
        ? { ...item, kategoriId, namaKategori: katalog?.nama || '', hargaPerKg: katalog?.hargaPerKg || 0, kategori: katalog?.kategori || '' }
        : item
    ));
  };

  const handleBeratChange = (index: string, berat: number) => {
    setItems(prev => prev.map((item, i) => 
      i === parseInt(index) ? { ...item, berat: Math.max(0, berat) } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: String(Date.now()), kategoriId: '', kategori: '', namaKategori: '', berat: 0, hargaPerKg: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabah) { alert('Pilih nasabah terlebih dahulu'); return; }
    if (items.some(i => !i.kategoriId || i.berat <= 0)) { alert('Lengkapi semua item (kategori & berat > 0)'); return; }

    setSaving(true);
    try {
      const transaksiItems = items.map(item => ({
        kategoriId: item.kategoriId,
        namaKategori: item.namaKategori,
        kategori: item.kategori as any,
        berat: item.berat,
        hargaPerKg: item.hargaPerKg,
        subtotal: item.berat * item.hargaPerKg,
      }));

      const id = await addTransaksi({
        nasabahId: selectedNasabah,
        petugasId: user?.uid || 'demo',
        petugasNama: user?.nama || 'Petugas',
        items: transaksiItems,
        totalBerat,
        totalNilai,
        status: 'synced',
      });

      setLastTransaction({ id, total: totalNilai });
      setShowSuccess(true);
      
      // Reset form
      setSelectedNasabah(null);
      setItems([{ id: '1', kategoriId: '', kategori: '', namaKategori: '', berat: 0, hargaPerKg: 0 }]);
      setSearchQuery('');
    } catch {
      alert('Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
    }
  };

  const handleScanResult = (code: string) => {
    const nasabah = nasabahList.find(n => n.qrCode === code || n.id === code);
    if (nasabah) {
      setSelectedNasabah(nasabah.id);
      setSearchQuery('');
      setScannerOpen(false);
    } else {
      alert('Nasabah tidak ditemukan untuk kode: ' + code);
    }
  };

  const printReceipt = () => {
    if (!lastTransaction || !nasabah) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Transaksi - Bank Sampah Pandawa Berjaya</title>
          <style>
            body { font-family: monospace; font-size: 12px; padding: 20px; width: 280px; margin: 0 auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center bold">BANK SAMPAH PANDAWA BERJAYA</div>
          <div class="center">Jl. Martorejo No.3, Banyumanik</div>
          <div class="center">Kota Semarang</div>
          <div class="line"></div>
          <div class="row"><span>No Transaksi:</span><span>${lastTransaction.id}</span></div>
          <div class="row"><span>Tanggal:</span><span>${new Date().toLocaleString('id-ID')}</span></div>
          <div class="row"><span>Petugas:</span><span>${user?.nama}</span></div>
          <div class="line"></div>
          <div class="row bold"><span>Nasabah:</span><span>${nasabah.nama}</span></div>
          <div class="row"><span>ID:</span><span>${nasabah.id}</span></div>
          <div class="row"><span>Saldo Sebelumnya:</span><span>${formatRupiah(nasabah.saldo - totalNilai)}</span></div>
          <div class="line"></div>
          ${items.filter(i => i.kategoriId).map(item => `
            <div class="row"><span>${item.namaKategori}</span><span>${formatNumber(item.berat)} kg x ${formatRupiah(item.hargaPerKg)}</span></div>
            <div class="row"><span></span><span>${formatRupiah(item.berat * item.hargaPerKg)}</span></div>
          `).join('')}
          <div class="line"></div>
          <div class="row total"><span>TOTAL</span><span>${formatRupiah(totalNilai)}</div>
          <div class="row total"><span>SALDO BARU</span><span>${formatRupiah(nasabah.saldo)}</div>
          <div class="line"></div>
          <div class="center" style="margin-top: 16px;">Terima kasih telah menabung sampah!</div>
          <div class="center" style="margin-top: 8px; font-size: 10px;">Simpan struk ini sebagai bukti setoran</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <>
      <PageHeader
        title="Transaksi Penimbangan"
        subtitle="Catat setoran sampah nasabah secara real-time"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Transaksi' }]}
      />

      <Alert variant="info">
        <strong>Mode Demo:</strong> Data tersimpan di memori browser. Integrasi Firebase & printer fisik untuk produksi.
      </Alert>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">1. Pilih Nasabah</h3>
            <div className="relative">
              <Input
                label="Cari Nasabah"
                placeholder="Ketik nama, ID, atau scan QR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Button variant="secondary" onClick={() => setScannerOpen(true)} className="absolute right-3 top-[38px]" size="sm">
                <ScanLine className="w-4 h-4 mr-1" />
                Scan QR
              </Button>
            </div>
            
            {searchQuery && filteredNasabah.length > 0 && (
              <div className="mt-3 max-h-48 overflow-y-auto border border-border rounded-lg bg-surface scrollbar-thin">
                {filteredNasabah.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { setSelectedNasabah(n.id); setSearchQuery(n.nama); }}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-surface-elevated transition-colors flex items-center gap-3 border-b border-border/50 last:border-0',
                      selectedNasabah === n.id && 'bg-primary/5 border-primary/20'
                    )}
                  >
                    <Avatar name={n.nama} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{n.nama}</p>
                      <p className="text-xs text-text-secondary">ID: {n.id} • RT {n.rt}/RW {n.rw}</p>
                    </div>
                    <Badge variant="success" className="text-xs">{formatRupiah(n.saldo)}</Badge>
                  </button>
                ))}
              </div>
            )}

            {selectedNasabah && nasabah && (
              <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg animate-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={nasabah.nama} size="md" />
                    <div>
                      <p className="font-semibold text-text-primary">{nasabah.nama}</p>
                      <p className="text-sm text-text-secondary">RT {nasabah.rt}/RW {nasabah.rw} • ID: {nasabah.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">Saldo Saat Ini</p>
                    <p className="text-2xl font-bold text-success tabular-nums">{formatRupiah(nasabah.saldo)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedNasabah(null)} className="mt-2">
                  <X className="w-4 h-4 mr-1" /> Ganti Nasabah
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">2. Item Sampah</h3>
              <Button variant="secondary" size="sm" onClick={addItem} leftIcon={<Plus className="w-4 h-4" />}>
                Tambah Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_80px_100px_40px] items-end p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
                  <Select
                    label="Jenis Sampah"
                    placeholder="Pilih kategori"
                    value={item.kategoriId}
                    onChange={(e) => handleKategoriChange(String(index), e.target.value)}
                    options={[
                      { value: '', label: 'Pilih kategori...' },
                      ...katalogList.filter(k => k.aktif).map(k => ({ value: k.id, label: `${k.nama} (${formatRupiah(k.hargaPerKg)}/kg)` }))
                    ]}
                    required
                  />
                  <Input
                    label="Berat (kg)"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={item.berat}
                    onChange={(e) => handleBeratChange(String(index), parseFloat(e.target.value) || 0)}
                    required
                  />
                  <div>
                    <label className="label">Subtotal</label>
                    <div className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary tabular-nums min-h-[42px] flex items-center">
                      {formatRupiah(item.berat * item.hargaPerKg)}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="h-10 text-error hover:text-error" aria-label="Hapus item">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border bg-surface-elevated/50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-text-secondary">Total Berat</p>
                  <p className="text-2xl font-bold text-text-primary tabular-nums">{formatNumber(totalBerat)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Jumlah Item</p>
                  <p className="text-2xl font-bold text-text-primary tabular-nums">{items.filter(i => i.kategoriId).length}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Nilai</p>
                  <p className="text-2xl font-bold text-primary tabular-nums">{formatRupiah(totalNilai)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-text-primary mb-4">3. Simpan Transaksi</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                form="transaksi-form"
                size="lg" 
                className="flex-1" 
                loading={saving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Simpan & Cetak Struk
              </Button>
              <Button variant="secondary" size="lg" onClick={printReceipt} disabled={!lastTransaction} leftIcon={<Printer className="w-4 h-4" />} className="flex-1 sm:flex-none">
                Cetak Ulang
              </Button>
            </div>
            <form id="transaksi-form" onSubmit={handleSubmit} className="hidden">
              <input type="submit" hidden />
            </form>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">Katalog Harga Referensi</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {KATEGORI_SAMPAH.map(kat => {
                const katalogItems = katalogList.filter(k => k.kategori === kat.value && k.aktif);
                if (katalogItems.length === 0) return null;
                return (
                  <div key={kat.value} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <h4 className="text-sm font-medium text-text-secondary capitalize mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: kat.color.split(' ')[1] }} />
                      {kat.label}
                    </h4>
                    <div className="space-y-1">
                      {katalogItems.map(k => (
                        <div key={k.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-surface-elevated/50 cursor-pointer transition-colors" 
                          onClick={() => {
                            const emptyIndex = items.findIndex(i => !i.kategoriId);
                            if (emptyIndex >= 0) handleKategoriChange(String(emptyIndex), k.id);
                            else addItem(); handleKategoriChange(String(items.length), k.id);
                          }}
                        >
                          <span className="text-text-primary">{k.nama}</span>
                          <Badge variant="neutral" className="text-xs">{formatRupiah(k.hargaPerKg)}/kg</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-text-primary mb-4">Panduan Cepat</h3>
            <div className="space-y-3 text-sm">
              <GuideStep number={1} text="Scan QR Code nasabah atau cari nama di kolom pencarian" />
              <GuideStep number={2} text="Pilih jenis sampah dari daftar katalog (harga otomatis terisi)" />
              <GuideStep number={3} text="Masukkan berat per kategori dalam kg (desimal diperbolehkan)" />
              <GuideStep number={4} text="Tekan 'Simpan & Cetak Struk' - saldo nasabah update otomatis" />
              <GuideStep number={5} text="Struk tercetak berisi detail item, total, & saldo baru nasabah" />
            </div>
          </Card>
        </div>
      </div>

      <Modal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} title="Scan QR Code Nasabah" size="md">
        <div className="text-center py-4">
          <div className="w-48 h-48 mx-auto mb-4 rounded-lg bg-surface-elevated border border-border flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <ScanLine className="w-32 h-32 text-primary/50 animate-pulse" />
            </div>
            <svg className="w-24 h-24 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-secondary mb-4">Arahkan kamera ke QR Code nasabah</p>
          <div className="space-y-2">
            <Input
              placeholder="Atau masukkan kode manual: N001, N002..."
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleScanResult(scannedCode); }}
            />
            <Button onClick={() => handleScanResult(scannedCode)} disabled={!scannedCode} className="w-full">
              Cari Nasabah
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Transaksi Berhasil" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Transaksi Tersimpan!</h3>
          <p className="text-text-secondary mb-4">Struk telah dicetak. Saldo nasabah diperbarui.</p>
          {lastTransaction && (
            <div className="p-3 bg-surface-elevated rounded-lg text-left mb-4">
              <p className="text-sm"><span className="text-text-secondary">No: </span><span className="font-mono">{lastTransaction.id}</span></p>
              <p className="text-sm"><span className="text-text-secondary">Total: </span><span className="font-semibold text-primary">{formatRupiah(lastTransaction.total)}</span></p>
            </div>
          )}
          <Button onClick={() => setShowSuccess(false)} className="w-full">Selesai</Button>
        </div>
      </Modal>
    </>
  );
}

function GuideStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{number}</span>
      <p className="text-text-secondary">{text}</p>
    </div>
  );
}