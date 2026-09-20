import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function formatDate(date: Date | string | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate();
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate();
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string | { toDate: () => Date }): string {
  const d = date instanceof Date ? date : typeof date === 'string' ? new Date(date) : date.toDate();
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return formatDate(d);
}

export function generateQRCode(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('62')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+62${cleaned.slice(1)}`;
  return `+62${cleaned}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const KATEGORI_SAMPAH = [
  { value: 'plastik', label: 'Plastik', icon: 'recycle', color: 'text-blue-600 bg-blue-100' },
  { value: 'kertas', label: 'Kertas', icon: 'file-text', color: 'text-amber-600 bg-amber-100' },
  { value: 'kardus', label: 'Kardus', icon: 'box', color: 'text-orange-600 bg-orange-100' },
  { value: 'logam', label: 'Logam', icon: 'cog', color: 'text-gray-600 bg-gray-100' },
  { value: 'lainnya', label: 'Lainnya', icon: 'package', color: 'text-purple-600 bg-purple-100' },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  petugas: 'Petugas Penimbangan',
  admin: 'Admin / Pengurus',
  nasabah: 'Nasabah',
};

export const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  pending: { label: 'Menunggu Sync', class: 'badge-warning' },
  synced: { label: 'Tersinkron', class: 'badge-success' },
  failed: { label: 'Gagal', class: 'badge-error' },
};