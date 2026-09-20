export type UserRole = 'petugas' | 'admin' | 'nasabah';

export interface User {
  uid: string;
  role: UserRole;
  nama: string;
  email?: string;
  noWhatsApp?: string;
  fotoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Nasabah {
  id: string;
  nama: string;
  rt: string;
  rw: string;
  saldo: number;
  qrCode: string;
  noWhatsApp?: string;
  alamat?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransaksiItem {
  kategoriId: string;
  namaKategori: string;
  kategori: 'plastik' | 'kertas' | 'kardus' | 'logam' | 'lainnya';
  berat: number;
  hargaPerKg: number;
  subtotal: number;
}

export type TransaksiStatus = 'pending' | 'synced' | 'failed';

export interface Transaksi {
  id: string;
  nasabahId: string;
  nasabahNama?: string;
  petugasId: string;
  petugasNama?: string;
  items: TransaksiItem[];
  totalBerat: number;
  totalNilai: number;
  status: TransaksiStatus;
  createdAt: Date;
  syncedAt?: Date;
  notes?: string;
}

export interface KatalogHarga {
  id: string;
  nama: string;
  kategori: 'plastik' | 'kertas' | 'kardus' | 'logam' | 'lainnya';
  hargaPerKg: number;
  pengepul?: string;
  satuan: 'kg' | 'pcs';
  aktif: boolean;
  catatan?: string;
  updatedAt: Date;
  updatedBy: string;
  createdAt: Date;
}

export interface SOP {
  id: string;
  kategori: 'plastik' | 'kertas' | 'kardus' | 'logam' | 'umum';
  judul: string;
  deskripsi: string;
  gambarUrl?: string;
  versi: number;
  aktif: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
}

export interface DashboardStats {
  totalTransaksiHariIni: number;
  totalBeratHariIni: number;
  totalNilaiHariIni: number;
  nasabahAktifHariIni: number;
  totalNasabah: number;
  totalSaldoNasabah: number;
}

export interface TransaksiFilter {
  startDate?: Date;
  endDate?: Date;
  nasabahId?: string;
  status?: TransaksiStatus;
  petugasId?: string;
}

export interface SyncStatus {
  lastSync: Date | null;
  pendingCount: number;
  isOnline: boolean;
}

export interface BroadcastLog {
  id: string;
  template: string;
  targetFilter: string;
  targetCount: number;
  sentCount: number;
  failedCount: number;
  sentBy: string;
  sentAt: Date;
}