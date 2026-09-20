import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { 
  User, 
  Users, 
  CreditCard, 
  Eye, 
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Shield,
  BookOpen
} from 'lucide-react';
import { cn } from '../lib/utils';

const roles = [
  {
    key: 'petugas' as const,
    title: 'Petugas Penimbangan',
    description: 'Mencatat transaksi penimbangan sampah nasabah',
    icon: User,
    features: ['Scan QR Code nasabah', 'Input berat per kategori', 'Cetak struk otomatis', 'Mode offline siap pakai'],
    color: 'bg-blue-500',
    iconColor: 'text-blue-500',
    borderSelected: 'border-blue-500 dark:border-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:border-blue-400 dark:hover:border-blue-600',
  },
  {
    key: 'admin' as const,
    title: 'Admin / Pengurus',
    description: 'Mengelola nasabah, katalog harga, SOP, dan laporan',
    icon: Users,
    features: ['Kelola data nasabah', 'Atur katalog harga jual', 'Kelola SOP digital', 'Laporan & dashboard'],
    color: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    borderSelected: 'border-emerald-500 dark:border-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
  },
  {
    key: 'nasabah' as const,
    title: 'Nasabah',
    description: 'Cek saldo tabungan dan riwayat setoran sampah',
    icon: CreditCard,
    features: ['Lihat saldo real-time', 'Riwayat transaksi lengkap', 'Akses panduan pemilahan', 'Notifikasi WhatsApp'],
    color: 'bg-amber-500',
    iconColor: 'text-amber-500',
    borderSelected: 'border-amber-500 dark:border-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:border-amber-400 dark:hover:border-amber-600',
  },
];

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<'petugas' | 'admin' | 'nasabah'>('petugas');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { nasabahList } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Nama harus diisi');
      return;
    }

    if (selectedRole !== 'nasabah' && !password) {
      setError('Password diperlukan untuk petugas dan admin');
      return;
    }

    try {
      await login(selectedRole, name.trim());
      navigate(selectedRole === 'nasabah' ? '/portal' : '/dashboard');
    } catch {
      setError('Gagal masuk. Silakan coba lagi.');
    }
  };

  const roleConfig = roles.find(r => r.key === selectedRole)!;
  const Icon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={() => {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            } else {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            }
          }}
          className="p-3 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full shadow-sm border border-border/50 transition-colors bg-surface-elevated"
          title="Toggle theme"
        >
          <svg className="w-6 h-6 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg className="w-6 h-6 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
      <div className="w-full max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="lg:order-2">
            <div className="text-center lg:text-left mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
                Bank Sampah Pandawa Berjaya
              </h1>
              <p className="text-text-secondary text-lg">
                Sistem Informasi & Knowledge Management<br />
                Pilar Smart Environment - Kota Semarang
              </p>
            </div>

            <Card className={cn(roleConfig.bg, roleConfig.hover, 'border-2 transition-all duration-200')}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', roleConfig.color)}>
                    <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{roleConfig.title}</h2>
                    <p className="text-sm font-medium text-text-secondary">{roleConfig.description}</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6" role="list">
                  {roleConfig.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                      <CheckCircle2 className={cn('w-5 h-5 flex-shrink-0', roleConfig.text)} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    autoComplete="name"
                  />

                  {(selectedRole === 'petugas' || selectedRole === 'admin') && (
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-text-muted hover:text-text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}

                  {selectedRole === 'nasabah' && nasabahList.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-2">
                      <p className="text-xs text-amber-800 dark:text-amber-300 mb-1 font-medium">Contoh Nasabah untuk Demo:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {nasabahList.slice(0, 4).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => setName(n.nama)}
                            className="text-xs px-2 py-1 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-700 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors text-left"
                          >
                            {n.nama}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error flex items-center gap-2" role="alert">
                      <Shield className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" loading={loading}>
                    Masuk sebagai {roleConfig.title}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-text-muted">
                  Demo: Gunakan nama apa saja. Password opsional untuk nasabah.
                </p>
              </div>
            </Card>
          </div>

          <div className="lg:order-1 hidden lg:block">
            <div className="bg-surface rounded-2xl shadow-xl p-8 space-y-6 border border-border">
              <h3 className="text-lg font-bold text-text-primary">Pilih Peran Anda</h3>
              <div className="grid gap-4" role="radiogroup" aria-label="Pilih peran login">
                {roles.map(role => (
                  <button
                    key={role.key}
                    onClick={() => setSelectedRole(role.key)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all duration-200 text-left group',
                      selectedRole === role.key
                        ? `${role.borderSelected} bg-surface-elevated shadow-lg`
                        : 'border-border hover:border-primary/50'
                    )}
                    role="radio"
                    aria-checked={selectedRole === role.key}
                    aria-label={role.title}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', role.bg)}>
                        <role.icon className={cn('w-5 h-5', role.iconColor)} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary group-hover:text-primary transition-colors">{role.title}</h4>
                        <p className="text-sm font-medium text-text-secondary mt-0.5">{role.description}</p>
                      </div>
                      {selectedRole === role.key && (
                        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center', role.color)}>
                          <CheckCircle2 className="w-3 h-3 text-white" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-bold text-text-primary mb-3">Fitur Unggulan KMS</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FeatureCard icon={<Shield className="w-5 h-5" />} title="Data Terintegrasi" desc="Satu sistem untuk transaksi, saldo & laporan" />
                  <FeatureCard icon={<BookOpen className="w-5 h-5" />} title="SOP Digital" desc="Panduan pemilahan terdokumentasi & terpusat" />
                  <FeatureCard icon={<Users className="w-5 h-5" />} title="Transparansi Nasabah" desc="Cek saldo & riwayat mandiri via HP" />
                  <FeatureCard icon={<CheckCircle2 className="w-5 h-5" />} title="Kontinuitas Organisasi" desc="Pengetahuan tidak hilang saat pergantian pengurus" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-4 bg-surface-elevated rounded-lg border border-border">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h5 className="font-semibold text-text-primary text-sm">{title}</h5>
      <p className="text-xs font-medium text-text-secondary mt-1">{desc}</p>
    </div>
  );
}