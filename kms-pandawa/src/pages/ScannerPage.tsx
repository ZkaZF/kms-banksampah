import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Button, Input, Badge, Alert, Modal, Avatar } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah, formatNumber, generateId } from '../lib/utils';
import { 
  ScanLine, 
  X, 
  Check, 
  Save, 
  Printer, 
  Camera, 
  RotateCcw,
  FlashlightOff,
  Flashlight,
  WifiOff,
  Wifi,
  Clock,
  Plus,
  Minus,
  Trash2,
  Package,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Html5Qrcode } from 'html5-qrcode';

export function ScannerPage() {
  const { nasabahList, katalogList, addTransaksi } = useData();
  const { user } = useAuth();

  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraId, setCameraId] = useState<string>('environment');
  const [selectedNasabah, setSelectedNasabah] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [items, setItems] = useState<Array<{
    id: string;
    kategoriId: string;
    kategori: string;
    namaKategori: string;
    berat: number;
    hargaPerKg: number;
  }>>([]);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<{ id: string; total: number; nasabah: string } | null>(null);
  const [offlineQueue, setOfflineQueue] = useState<number>(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [scannerReady, setScannerReady] = useState(false);

  // Satisfy noUnusedLocals - used in useCallback callbacks
  void setScanner;
  void setScannerReady;

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initScanner = useCallback(async () => {
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      setScanner(html5Qrcode);
      
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length > 0) {
        const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear')) || cameras[0];
        setCameraId(backCamera.id);
      }
      setScannerReady(true);
    } catch (err) {
      console.error('Scanner init error:', err);
      setScannerReady(true);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    if (!scanner || !scanning) return;
    try {
      await scanner.stop();
      setScanning(false);
      setTorchOn(false);
    } catch (err) {
      console.error('Stop scan error:', err);
    }
  }, [scanner, scanning]);

  useEffect(() => {
    initScanner();
    return () => {
      if (scanner && scanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [initScanner, scanner, scanning]);

  const handleScanResult = useCallback((code: string) => {
    const nasabah = nasabahList.find(n => n.qrCode === code || n.id === code);
    if (nasabah) {
      setSelectedNasabah(nasabah.id);
      stopScanning();
    } else {
      alert('Nasabah tidak ditemukan untuk kode: ' + code);
    }
  }, [nasabahList, stopScanning]);

  const startScanning = useCallback(async () => {
    if (!scanner || scanning) return;
    try {
      await scanner.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
        (decodedText) => {
          handleScanResult(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      console.error('Start scan error:', err);
      alert('Gagal memulai kamera. Pastikan izin kamera diberikan.');
    }
  }, [scanner, scanning, cameraId, handleScanResult]);

  const toggleTorch = async () => {
    if (!scanning) return;
    setTorchOn(!torchOn);
  };

  const switchCamera = async () => {
    if (!scanner) return;
    const cameras = await Html5Qrcode.getCameras();
    const currentIndex = cameras.findIndex(c => c.id === cameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const newCameraId = cameras[nextIndex].id;
    setCameraId(newCameraId);
    if (scanning) {
      await stopScanning();
      await startScanning();
    }
  };

  const handleManualSubmit = () => {
    handleScanResult(manualCode.trim());
    setManualCode('');
  };

  const nasabah = selectedNasabah ? nasabahList.find(n => n.id === selectedNasabah) : null;

  const handleKategoriChange = (index: number, kategoriId: string) => {
    const katalog = katalogList.find(k => k.id === kategoriId);
    setItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, kategoriId, namaKategori: katalog?.nama || '', hargaPerKg: katalog?.hargaPerKg || 0, kategori: katalog?.kategori || '' }
        : item
    ));
  };

  const handleBeratChange = (index: number, berat: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, berat: Math.max(0, berat) } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: generateId(), kategoriId: '', kategori: '', namaKategori: '', berat: 0, hargaPerKg: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const incrementBerat = (index: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, berat: Math.round((item.berat + 0.1) * 10) / 10 } : item
    ));
  };

  const decrementBerat = (index: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, berat: Math.max(0.1, Math.round((item.berat - 0.1) * 10) / 10) } : item
    ));
  };

  const totalBerat = items.reduce((sum, item) => sum + item.berat, 0);
  const totalNilai = items.reduce((sum, item) => sum + (item.berat * item.hargaPerKg), 0);

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
        status: online ? 'synced' : 'pending',
      });

      setLastTransaction({ id, total: totalNilai, nasabah: nasabah?.nama || '' });
      setShowSuccess(true);
      
      if (!online) {
        setOfflineQueue(prev => prev + 1);
      }

      // Reset form
      setSelectedNasabah(null);
      setItems([]);
      setManualCode('');
    } catch {
      alert('Gagal menyimpan transaksi');
    } finally {
      setSaving(false);
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

  if (!scanning && !scannerReady) {
    return (
      <>
        <div className="max-w-2xl mx-auto text-center py-12">
          <Camera className="w-16 h-16 mx-auto text-text-muted/50 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Memulai Scanner...</h2>
          <p className="text-text-secondary">Mohon tunggu, menginisialisasi kamera</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Mode Scanner Penimbangan"
        subtitle="Scan QR nasabah, timbang sampah, simpan transaksi - offline ready"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Scanner' }]}
      />

      {!online && (
        <Alert variant="warning">
          <strong>Mode Offline:</strong> Transaksi akan disimpan lokal dan disinkronkan saat online kembali.
        </Alert>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Scanner Section */}
        <Card className={cn('relative', scanning ? '' : 'bg-surface-elevated/50')}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-text-primary">1. Scan QR Code Nasabah</h3>
            <div className="flex items-center gap-2">
              <Badge variant={online ? 'success' : 'warning'} className="gap-1">
                {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {online ? 'Online' : 'Offline'}
              </Badge>
              {offlineQueue > 0 && (
                <Badge variant="warning" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {offlineQueue} antrean sync
                </Badge>
              )}
            </div>
          </div>

          {scanning ? (
            <>
              <div className="relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border border-border bg-black">
                <div id="qr-reader" className="w-full h-full" style={{ minHeight: '300px' }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-primary/50 rounded-lg relative">
                    <ScanLine className="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                  <p className="text-white text-center text-sm">Arahkan QR Code ke area scan</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={toggleTorch} leftIcon={torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}>
                  {torchOn ? 'Matikan Flash' : 'Nyalakan Flash'}
                </Button>
                <Button variant="secondary" onClick={switchCamera} leftIcon={<RotateCcw className="w-4 h-4" />}>
                  Ganti Kamera
                </Button>
                <Button variant="secondary" onClick={stopScanning} leftIcon={<X className="w-4 h-4" />}>
                  Hentikan Scan
                </Button>
              </div>
            </>
          ) : (
            <div className="aspect-square max-w-xs mx-auto rounded-lg bg-surface-elevated border-2 border-dashed border-border flex flex-col items-center justify-center">
              <Camera className="w-16 h-16 text-text-muted/50 mb-3" />
              <p className="text-text-secondary mb-4">Kamera belum dimulai</p>
              <Button onClick={startScanning} size="lg" leftIcon={<Camera className="w-4 h-4" />}>
                Mulai Scan QR
              </Button>
            </div>
          )}

          <div className="mt-4 p-3 bg-surface-elevated/50 rounded-lg border border-border/50">
            <label className="block text-sm font-medium text-text-secondary mb-2">Input Manual Kode Nasabah</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Contoh: N001, N002..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleManualSubmit(); }}
                className="flex-1"
              />
              <Button onClick={handleManualSubmit} disabled={!manualCode.trim()} leftIcon={<Search className="w-4 h-4" />}>
                Cari
              </Button>
            </div>
          </div>
        </Card>

        {/* Selected Nasabah */}
        {selectedNasabah && nasabah && (
          <Card className="bg-success/5 border-success/20 animate-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={nasabah.nama} size="lg" />
                <div>
                  <p className="font-semibold text-text-primary">{nasabah.nama}</p>
                  <p className="text-sm text-text-secondary">ID: {nasabah.id} • RT {nasabah.rt}/RW {nasabah.rw}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Saldo Saat Ini</p>
                <p className="text-2xl font-bold text-success tabular-nums">{formatRupiah(nasabah.saldo)}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedNasabah(null); setItems([]); }} className="mt-3">
              <X className="w-4 h-4 mr-1" /> Ganti Nasabah
            </Button>
          </Card>
        )}

        {/* Items Input */}
        {selectedNasabah && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-primary">2. Item Sampah</h3>
              <Button variant="secondary" size="sm" onClick={addItem} leftIcon={<Plus className="w-4 h-4" />}>
                Tambah Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid gap-3 md:grid-cols-[1fr_70px_70px_50px_40px] items-end p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
                  <select
                    className="input"
                    value={item.kategoriId}
                    onChange={(e) => handleKategoriChange(index, e.target.value)}
                    required
                  >
                    <option value="">Pilih kategori...</option>
                    {katalogList.filter(k => k.aktif).map(k => (
                      <option key={k.id} value={k.id}>{k.nama} ({formatRupiah(k.hargaPerKg)}/kg)</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => decrementBerat(index)} className="p-1.5" aria-label="Kurangi berat">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={item.berat}
                      onChange={(e) => handleBeratChange(index, parseFloat(e.target.value) || 0)}
                      className="w-20 text-center"
                      required
                    />
                    <Button variant="ghost" size="sm" onClick={() => incrementBerat(index)} className="p-1.5" aria-label="Tambah berat">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary tabular-nums min-h-[42px] flex items-center justify-center">
                    {formatRupiah(item.berat * item.hargaPerKg)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="h-10 text-error hover:text-error" aria-label="Hapus item">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {items.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <Package className="w-12 h-12 mx-auto text-text-muted/50 mb-3" />
                <p>Belum ada item sampah. Tambah item pertama untuk memulai.</p>
              </div>
            )}

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
        )}

        {/* Save Section */}
        {selectedNasabah && (
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">3. Simpan Transaksi</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                form="scanner-transaksi-form"
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
            <form id="scanner-transaksi-form" onSubmit={handleSubmit} className="hidden">
              <input type="submit" hidden />
            </form>
          </Card>
        )}

        {/* Quick Reference */}
        <Card>
          <h3 className="font-semibold text-text-primary mb-4">Referensi Harga Cepat</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {katalogList.filter(k => k.aktif).slice(0, 8).map(k => (
              <button
                key={k.id}
                onClick={() => {
                  if (!selectedNasabah) return;
                  const emptyIndex = items.findIndex(i => !i.kategoriId);
                  if (emptyIndex >= 0) handleKategoriChange(emptyIndex, k.id);
                  else { addItem(); handleKategoriChange(items.length, k.id); }
                }}
                disabled={!selectedNasabah}
                className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="font-medium text-text-primary text-sm">{k.nama}</p>
                <p className="text-xs text-text-secondary">{formatRupiah(k.hargaPerKg)}/kg</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Transaksi Berhasil" size="sm">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Transaksi Tersimpan!</h3>
          <p className="text-text-secondary mb-4">Saldo nasabah diperbarui. Struk siap dicetak.</p>
          {lastTransaction && (
            <div className="p-3 bg-surface-elevated rounded-lg text-left mb-4">
              <p className="text-sm"><span className="text-text-secondary">No: </span><span className="font-mono">{lastTransaction.id}</span></p>
              <p className="text-sm"><span className="text-text-secondary">Nasabah: </span><span className="font-medium">{lastTransaction.nasabah}</span></p>
              <p className="text-sm"><span className="text-text-secondary">Total: </span><span className="font-semibold text-primary">{formatRupiah(lastTransaction.total)}</span></p>
              <p className="text-sm"><span className="text-text-secondary">Status: </span><span className={online ? 'text-success' : 'text-warning'}>{online ? 'Tersinkron' : 'Menunggu Sync (Offline)'}</span></p>
            </div>
          )}
          <Button onClick={() => setShowSuccess(false)} className="w-full">Selesai</Button>
        </div>
      </Modal>
    </>
  );
}

function Search({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}