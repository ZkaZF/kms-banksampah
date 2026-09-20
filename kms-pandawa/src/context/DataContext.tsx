import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { Nasabah, Transaksi, KatalogHarga, SOP, DashboardStats, TransaksiFilter, BroadcastLog } from '../types';
import { generateId } from '../lib/utils';
import { isOnline, queueOperation, getQueuedOperations, removeOperation, incrementRetry, registerBackgroundSync, onOnlineChange } from '../lib/offline';

interface DataContextType {
  // Nasabah
  nasabahList: Nasabah[];
  getNasabah: (id: string) => Nasabah | undefined;
  searchNasabah: (keyword: string) => Nasabah[];
  addNasabah: (data: Omit<Nasabah, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateNasabah: (id: string, data: Partial<Nasabah>) => Promise<void>;
  deleteNasabah: (id: string) => Promise<void>;
  
  // Transaksi
  transaksiList: Transaksi[];
  getTransaksi: (id: string) => Transaksi | undefined;
  getTransaksiByNasabah: (nasabahId: string) => Transaksi[];
  addTransaksi: (data: Omit<Transaksi, 'id' | 'createdAt' | 'syncedAt'>) => Promise<string>;
  updateTransaksi: (id: string, data: Partial<Transaksi>) => Promise<void>;
  filterTransaksi: (filter: TransaksiFilter) => Transaksi[];
  
  // Katalog
  katalogList: KatalogHarga[];
  getKatalog: (id: string) => KatalogHarga | undefined;
  getKatalogByKategori: (kategori: KatalogHarga['kategori']) => KatalogHarga[];
  addKatalog: (data: Omit<KatalogHarga, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateKatalog: (id: string, data: Partial<KatalogHarga>) => Promise<void>;
  deleteKatalog: (id: string) => Promise<void>;
  
  // SOP
  sopList: SOP[];
  getSOP: (id: string) => SOP | undefined;
  getSOPByKategori: (kategori: SOP['kategori']) => SOP[];
  addSOP: (data: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSOP: (id: string, data: Partial<SOP>) => Promise<void>;
  deleteSOP: (id: string) => Promise<void>;
  
  // Dashboard
  stats: DashboardStats;
  refreshStats: () => Promise<void>;
  
  // Broadcast
  broadcastLog: BroadcastLog[];
  addBroadcastLog: (data: Omit<BroadcastLog, 'id' | 'sentAt'>) => Promise<string>;
  
  // Sync
  forceSync: () => Promise<void>;
  
  // Offline
  online: boolean;
  syncing: boolean;
  pendingCount: number;
  syncPendingOperations: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

// Mock data for demo
const mockNasabah: Nasabah[] = [
  { id: 'N001', nama: 'Budi Santoso', rt: '02', rw: '02', saldo: 55750, qrCode: 'N001', noWhatsApp: '081234567890', createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-09-19') },
  { id: 'N002', nama: 'Siti Rahayu', rt: '02', rw: '02', saldo: 42300, qrCode: 'N002', noWhatsApp: '081234567891', createdAt: new Date('2024-02-20'), updatedAt: new Date('2024-09-18') },
  { id: 'N003', nama: 'Ahmad Wijaya', rt: '03', rw: '02', saldo: 28900, qrCode: 'N003', noWhatsApp: '081234567892', createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-09-17') },
  { id: 'N004', nama: 'Dewi Lestari', rt: '01', rw: '02', saldo: 67500, qrCode: 'N004', noWhatsApp: '081234567893', createdAt: new Date('2024-04-05'), updatedAt: new Date('2024-09-19') },
  { id: 'N005', nama: 'Rudi Hermawan', rt: '02', rw: '02', saldo: 15600, qrCode: 'N005', noWhatsApp: '081234567894', createdAt: new Date('2024-05-12'), updatedAt: new Date('2024-09-16') },
];

const mockKatalog: KatalogHarga[] = [
  { id: 'K001', nama: 'PET Bottle Grade A', kategori: 'plastik', hargaPerKg: 3000, pengepul: 'CV Berkah Jaya', satuan: 'kg', aktif: true, catatan: 'Bersih, tidak bercampur tutup/label', updatedAt: new Date('2024-09-19'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K002', nama: 'PET Cup / Gelas', kategori: 'plastik', hargaPerKg: 2500, pengepul: 'CV Berkah Jaya', satuan: 'kg', aktif: true, catatan: 'Gelas plastik bening', updatedAt: new Date('2024-09-15'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K003', nama: 'Plastik HDPE (Sampah)', kategori: 'plastik', hargaPerKg: 2000, pengepul: 'CV Berkah Jaya', satuan: 'kg', aktif: true, catatan: 'Botol deterjen, shampoo', updatedAt: new Date('2024-09-10'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K004', nama: 'Kertas HVS / Putih', kategori: 'kertas', hargaPerKg: 2500, pengepul: 'UD Kertas Mandiri', satuan: 'kg', aktif: true, catatan: 'Kertas putih bersih', updatedAt: new Date('2024-09-18'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K005', nama: 'Kertas Koran / Majalah', kategori: 'kertas', hargaPerKg: 1500, pengepul: 'UD Kertas Mandiri', satuan: 'kg', aktif: true, catatan: 'Kertas berita', updatedAt: new Date('2024-09-12'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K006', nama: 'Kardus / Karton', kategori: 'kardus', hargaPerKg: 1500, pengepul: 'UD Kertas Mandiri', satuan: 'kg', aktif: true, catatan: 'Kardus kotak, dibuka datar', updatedAt: new Date('2024-09-14'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K007', nama: 'Logam Aluminium', kategori: 'logam', hargaPerKg: 8000, pengepul: 'Toko Logam Sejahtera', satuan: 'kg', aktif: true, catatan: 'Kaleng minuman, foil', updatedAt: new Date('2024-09-16'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
  { id: 'K008', nama: 'Besi / Baja', kategori: 'logam', hargaPerKg: 4000, pengepul: 'Toko Logam Sejahtera', satuan: 'kg', aktif: true, catatan: 'Besi bekas, kawat', updatedAt: new Date('2024-09-13'), updatedBy: 'admin', createdAt: new Date('2024-01-01') },
];

const mockSOP: SOP[] = [
  { id: 'S001', kategori: 'plastik', judul: 'Kriteria PET Bottle Grade A', deskripsi: 'Botol plastik PET (Polyethylene Terephthalate) yang bersih, tidak bercampur tutup/label, tidak penyok/parah. Warna transparan/putih. Dilarang: Botol minyak, deterjen, shampoo.', gambarUrl: '', versi: 1, aktif: true, createdAt: new Date('2024-09-01'), updatedAt: new Date('2024-09-01'), createdBy: 'admin', tags: ['PET', 'Grade A', 'Plastik'] },
  { id: 'S002', kategori: 'plastik', judul: 'Cara Memisahkan Tutup & Label Botol', deskripsi: '1. Buka tutup botol. 2. Lepas label plastik (jika mudah lepas). 3. Cuci bersih jika kotor. 4. Masukkan ke sak yang terpisah.', gambarUrl: '', versi: 1, aktif: true, createdAt: new Date('2024-09-05'), updatedAt: new Date('2024-09-05'), createdBy: 'admin', tags: ['Pemisahan', 'Tutup', 'Label'] },
  { id: 'S003', kategori: 'kertas', judul: 'Cara Memisahkan Kertas HVS dan Koran', deskripsi: 'Kertas HVS (putih bersih) dipisah dari koran/majalah. Kertas karbon, fax, dan kertas berwarna masuk kategori lain. Lipat rapi sebelum disetor.', gambarUrl: '', versi: 1, aktif: true, createdAt: new Date('2024-09-03'), updatedAt: new Date('2024-09-03'), createdBy: 'admin', tags: ['HVS', 'Koran', 'Pemisahan'] },
  { id: 'S004', kategori: 'kardus', judul: 'Persiapan Kardus Sebelum Disetor', deskripsi: '1. Buka kotak kardus agar datar. 2. Lepas plastik tape/lem. 3. Pisahkan dari isi plastik/styrofoam. 4. Tumpuk rapi.', gambarUrl: '', versi: 1, aktif: true, createdAt: new Date('2024-09-07'), updatedAt: new Date('2024-09-07'), createdBy: 'admin', tags: ['Kardus', 'Persiapan', 'Datar'] },
  { id: 'S005', kategori: 'logam', judul: 'Kriteria Kaleng Aluminium', deskripsi: 'Kaleng minuman (soda, bir, jus) aluminium. Bersihkan sisa minuman. Tidak perlu dikepala. Pisahkan dari kaleng besi (makanan kaleng).', gambarUrl: '', versi: 1, aktif: true, createdAt: new Date('2024-09-09'), updatedAt: new Date('2024-09-09'), createdBy: 'admin', tags: ['Aluminium', 'Kaleng', 'Bersih'] },
  { id: 'S006', kategori: 'umum', judul: 'Prosedur Penimbangan & Pencatatan', deskripsi: '1. Scan QR Code nasabah. 2. Timbang per jenis sampah. 3. Input berat ke sistem. 4. Sistem hitung otomatis. 5. Cetak struk/kirim WhatsApp. 6. Simpan transaksi.', gambarUrl: '', versi: 2, aktif: true, createdAt: new Date('2024-08-20'), updatedAt: new Date('2024-09-15'), createdBy: 'admin', tags: ['Prosedur', 'Penimbangan', 'Pencatatan'] },
];

const mockTransaksi: Transaksi[] = [
  { id: 'T001', nasabahId: 'N001', nasabahNama: 'Budi Santoso', petugasId: 'P001', petugasNama: 'Rosi Yusepta', items: [{ kategoriId: 'K001', namaKategori: 'PET Bottle Grade A', kategori: 'plastik', berat: 2.5, hargaPerKg: 3000, subtotal: 7500 }, { kategoriId: 'K004', namaKategori: 'Kertas HVS / Putih', kategori: 'kertas', berat: 1.0, hargaPerKg: 2500, subtotal: 2500 }, { kategoriId: 'K006', namaKategori: 'Kardus / Karton', kategori: 'kardus', berat: 0.5, hargaPerKg: 1500, subtotal: 750 }], totalBerat: 4.0, totalNilai: 10750, status: 'synced', createdAt: new Date('2024-09-19T08:30:00'), syncedAt: new Date('2024-09-19T08:30:05') },
  { id: 'T002', nasabahId: 'N002', nasabahNama: 'Siti Rahayu', petugasId: 'P001', petugasNama: 'Rosi Yusepta', items: [{ kategoriId: 'K006', namaKategori: 'Kardus / Karton', kategori: 'kardus', berat: 3.0, hargaPerKg: 1500, subtotal: 4500 }, { kategoriId: 'K008', namaKategori: 'Besi / Baja', kategori: 'logam', berat: 0.5, hargaPerKg: 4000, subtotal: 2000 }], totalBerat: 3.5, totalNilai: 6500, status: 'synced', createdAt: new Date('2024-09-19T09:15:00'), syncedAt: new Date('2024-09-19T09:15:03') },
  { id: 'T003', nasabahId: 'N003', nasabahNama: 'Ahmad Wijaya', petugasId: 'P001', petugasNama: 'Rosi Yusepta', items: [{ kategoriId: 'K001', namaKategori: 'PET Bottle Grade A', kategori: 'plastik', berat: 1.5, hargaPerKg: 3000, subtotal: 4500 }], totalBerat: 1.5, totalNilai: 4500, status: 'synced', createdAt: new Date('2024-09-18T14:20:00'), syncedAt: new Date('2024-09-18T14:20:02') },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [nasabahList, setNasabahList] = useState<Nasabah[]>(mockNasabah);
  
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>(mockTransaksi);
  
  const [katalogList, setKatalogList] = useState<KatalogHarga[]>(mockKatalog);
  
  const [sopList, setSopList] = useState<SOP[]>(mockSOP);
  
  const [broadcastLog, setBroadcastLog] = useState<BroadcastLog[]>([]);
  
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const syncPendingOperations = async () => {
    if (!online || syncing) return;
    setSyncing(true);
    
    try {
      const operations = await getQueuedOperations();
      for (const op of operations) {
        try {
          if (op.type === 'transaksi' && op.action === 'create') {
            setTransaksiList(prev => prev.map(t => 
              t.id === op.data.id ? { ...t, status: 'synced' as const, syncedAt: new Date() } : t
            ));
          }
          await removeOperation(op.id);
        } catch (err) {
          console.error('Sync operation failed:', op.id, err);
          await incrementRetry(op.id);
        }
      }
      const remaining = await getQueuedOperations();
      setPendingCount(remaining.length);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    setOnline(isOnline());
    getQueuedOperations().then(ops => setPendingCount(ops.length));
    registerBackgroundSync();

    const cleanup = onOnlineChange((isOn) => {
      setOnline(isOn);
      if (isOn) {
        syncPendingOperations();
      }
    });

    return cleanup;
  }, [syncPendingOperations]);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalTransaksiHariIni: 0,
    totalBeratHariIni: 0,
    totalNilaiHariIni: 0,
    nasabahAktifHariIni: 0,
    totalNasabah: 0,
    totalSaldoNasabah: 0,
  });

  const calculateStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransaksi = transaksiList.filter(t => {
      const created = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
      return created >= today && created < tomorrow;
    });

    const nasabahAktif = new Set(todayTransaksi.map(t => t.nasabahId)).size;
    const totalBerat = todayTransaksi.reduce((sum, t) => sum + t.totalBerat, 0);
    const totalNilai = todayTransaksi.reduce((sum, t) => sum + t.totalNilai, 0);
    const totalSaldo = nasabahList.reduce((sum, n) => sum + n.saldo, 0);

    setStats({
      totalTransaksiHariIni: todayTransaksi.length,
      totalBeratHariIni: totalBerat,
      totalNilaiHariIni: totalNilai,
      nasabahAktifHariIni: nasabahAktif,
      totalNasabah: nasabahList.length,
      totalSaldoNasabah: totalSaldo,
    });
  }, [transaksiList, nasabahList]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const refreshStats = async () => {
    calculateStats();
  };

  // Nasabah
  const getNasabah = (id: string) => nasabahList.find(n => n.id === id);
  const searchNasabah = (keyword: string) => {
    const k = keyword.toLowerCase();
    return nasabahList.filter(n => 
      n.nama.toLowerCase().includes(k) || 
      n.id.toLowerCase().includes(k) ||
      n.qrCode.toLowerCase().includes(k)
    );
  };
  const addNasabah = async (data: Omit<Nasabah, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    const newNasabah: Nasabah = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    setNasabahList(prev => [...prev, newNasabah]);
    return id;
  };
  const updateNasabah = async (id: string, data: Partial<Nasabah>) => {
    setNasabahList(prev => prev.map(n => n.id === id ? { ...n, ...data, updatedAt: new Date() } : n));
  };
  const deleteNasabah = async (id: string) => {
    setNasabahList(prev => prev.filter(n => n.id !== id));
  };

  // Transaksi
  const getTransaksi = (id: string) => transaksiList.find(t => t.id === id);
  const getTransaksiByNasabah = (nasabahId: string) => 
    transaksiList.filter(t => t.nasabahId === nasabahId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const addTransaksi = async (data: Omit<Transaksi, 'id' | 'createdAt' | 'syncedAt'>) => {
    const id = generateId();
    const newTransaksi: Transaksi = { 
      ...data, 
      id, 
      createdAt: new Date(),
      status: online ? 'synced' : 'pending'
    };
    setTransaksiList(prev => [newTransaksi, ...prev]);
    
    // Update nasabah saldo
    const nasabah = getNasabah(data.nasabahId);
    if (nasabah) {
      updateNasabah(data.nasabahId, { saldo: nasabah.saldo + data.totalNilai });
    }

    // Queue for sync if offline
    if (!online) {
      await queueOperation({
        type: 'transaksi',
        action: 'create',
        data: newTransaksi,
      });
      setPendingCount(prev => prev + 1);
    }

    return id;
  };
  const updateTransaksi = async (id: string, data: Partial<Transaksi>) => {
    setTransaksiList(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };
  const filterTransaksi = (filter: TransaksiFilter) => {
    let result = [...transaksiList];
    if (filter.startDate) {
      result = result.filter(t => new Date(t.createdAt) >= filter.startDate!);
    }
    if (filter.endDate) {
      const end = new Date(filter.endDate);
      end.setHours(23, 59, 59);
      result = result.filter(t => new Date(t.createdAt) <= end);
    }
    if (filter.nasabahId) {
      result = result.filter(t => t.nasabahId === filter.nasabahId);
    }
    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter.petugasId) {
      result = result.filter(t => t.petugasId === filter.petugasId);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Katalog
  const getKatalog = (id: string) => katalogList.find(k => k.id === id);
  const getKatalogByKategori = (kategori: KatalogHarga['kategori']) => 
    katalogList.filter(k => k.kategori === kategori && k.aktif);
  const addKatalog = async (data: Omit<KatalogHarga, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    const newKatalog: KatalogHarga = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    setKatalogList(prev => [...prev, newKatalog]);
    return id;
  };
  const updateKatalog = async (id: string, data: Partial<KatalogHarga>) => {
    setKatalogList(prev => prev.map(k => k.id === id ? { ...k, ...data, updatedAt: new Date() } : k));
  };
  const deleteKatalog = async (id: string) => {
    setKatalogList(prev => prev.filter(k => k.id !== id));
  };

  // SOP
  const getSOP = (id: string) => sopList.find(s => s.id === id);
  const getSOPByKategori = (kategori: SOP['kategori']) => 
    sopList.filter(s => s.kategori === kategori && s.aktif);
  const addSOP = async (data: Omit<SOP, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    const newSOP: SOP = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    setSopList(prev => [...prev, newSOP]);
    return id;
  };
  const updateSOP = async (id: string, data: Partial<SOP>) => {
    setSopList(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date() } : s));
  };
  const deleteSOP = async (id: string) => {
    setSopList(prev => prev.filter(s => s.id !== id));
  };

  const addBroadcastLog = async (data: Omit<BroadcastLog, 'id' | 'sentAt'>) => {
    const id = generateId();
    const newLog: BroadcastLog = { ...data, id, sentAt: new Date() };
    setBroadcastLog(prev => [newLog, ...prev]);
    return id;
  };

  const forceSync = async () => {
    await syncPendingOperations();
    await new Promise(r => setTimeout(r, 1000));
    setTransaksiList(prev => prev.map(t => t.status === 'pending' ? { ...t, status: 'synced' as const, syncedAt: new Date() } : t));
  };

  return (
    <DataContext.Provider value={{
      nasabahList, getNasabah, searchNasabah, addNasabah, updateNasabah, deleteNasabah,
      transaksiList, getTransaksi, getTransaksiByNasabah, addTransaksi, updateTransaksi, filterTransaksi,
      katalogList, getKatalog, getKatalogByKategori, addKatalog, updateKatalog, deleteKatalog,
      sopList, getSOP, getSOPByKategori, addSOP, updateSOP, deleteSOP,
      stats, refreshStats, forceSync,
      broadcastLog, addBroadcastLog,
      online, syncing, pendingCount, syncPendingOperations,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export { DataContext };