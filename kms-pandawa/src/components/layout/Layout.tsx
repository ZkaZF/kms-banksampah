import React from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Avatar, Badge, Dropdown, Button, Modal } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  QrCode,
  BookOpen,
  ScanLine,
  MessageSquare,
  Database,
  WifiOff,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { name: 'Scanner', href: '/scan', icon: ScanLine, roles: ['petugas', 'admin'] },
  { name: 'Transaksi', href: '/transaksi', icon: QrCode, roles: ['petugas', 'admin'] },
  { name: 'Nasabah', href: '/nasabah', icon: Users, roles: ['admin'] },
  { name: 'Katalog Harga', href: '/katalog', icon: Package, roles: ['admin'] },
  { name: 'SOP Digital', href: '/sop', icon: BookOpen, roles: ['admin', 'petugas'] },
  { name: 'Laporan', href: '/laporan', icon: BarChart3, roles: ['admin'] },
  { name: 'Broadcast', href: '/broadcast', icon: MessageSquare, roles: ['admin'] },
];

export function Sidebar({ isOpen, onClose, onLogoutRequest }: { isOpen: boolean; onClose: () => void; onLogoutRequest: () => void }) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredNav = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      <div 
        className={cn('fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity', isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Navigasi utama"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border lg:justify-center">
          <Link to="/dashboard" className="flex items-center gap-2" aria-label="Bank Sampah Pandawa Berjaya - Dashboard">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-semibold text-text-primary hidden sm:block">Pandawa Berjaya</span>
          </Link>
          <button 
            onClick={onClose} 
            className="lg:hidden btn-ghost p-1.5" 
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu navigasi">
          {filteredNav.map(item => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-text-inverse shadow-sm'
                    : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user?.nama} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.nama}</p>
              <Badge variant="neutral" className="text-xs">{user?.role === 'admin' ? 'Admin' : user?.role === 'petugas' ? 'Petugas' : 'Nasabah'}</Badge>
            </div>
          </div>
          <div className="px-3 mt-2">
            <button onClick={onLogoutRequest} className="btn-ghost w-full justify-start gap-2 text-text-secondary hover:text-error">
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Header({ onMenuClick, onLogoutRequest }: { onMenuClick: () => void; onLogoutRequest: () => void }) {
  const { user } = useAuth();
  const { forceSync, online, syncing, pendingCount, syncPendingOperations } = useData();

  const profileItems = [
    { label: 'Profil', icon: <Settings className="w-4 h-4" />, onClick: () => {} },
    { label: 'Pengaturan', icon: <Settings className="w-4 h-4" />, onClick: () => {} },
    { label: 'Keluar', icon: <LogOut className="w-4 h-4" />, onClick: onLogoutRequest, danger: true },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/95 backdrop-blur-sm border-b border-border flex items-center px-4 lg:px-6">
      <button 
        onClick={onMenuClick} 
        className="lg:hidden btn-ghost p-2 -ml-2 mr-4" 
        aria-label="Buka menu"
        aria-expanded="false"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 lg:gap-6 truncate">
          <h1 className="text-lg font-semibold text-text-primary truncate hidden sm:block">
            Bank Sampah Pandawa Berjaya
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg bg-surface-elevated border border-border/50">
            <span className={cn('w-2 h-2 rounded-full', online ? 'bg-success' : 'bg-error')} />
            <span className="text-xs font-medium" style={{ color: online ? 'var(--color-success)' : 'var(--color-error)' }}>
              {online ? 'Online' : 'Offline'}
            </span>
            {pendingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-warning/10 text-warning rounded">
                {pendingCount} antrean
              </span>
            )}
          </div>

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
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-lg transition-colors"
            title="Toggle theme"
          >
            <svg className="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg className="w-5 h-5 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          {user?.role === 'admin' && (
            <Dropdown trigger={
              <Button variant="ghost" size="sm" leftIcon={<Bell className="w-4 h-4" />} className="hidden sm:flex">
                <span className="hidden sm:inline">Sinkron</span>
              </Button>
            } items={[
              { label: 'Sinkronisasi Data', icon: <RefreshCw className="w-4 h-4" />, onClick: forceSync, disabled: syncing },
              { label: syncing ? 'Menyinkronkan...' : online ? 'Status: Online' : 'Status: Offline', icon: online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />, onClick: () => {}, disabled: true },
              { label: pendingCount > 0 ? `${pendingCount} operasi tertunda` : 'Tidak ada antrean sync', icon: <Database className="w-4 h-4" />, onClick: syncPendingOperations, disabled: !online || syncing },
            ]} />
          )}

          <Dropdown trigger={
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar name={user?.nama} size="sm" />
              <span className="hidden md:block text-sm font-medium text-text-primary">{user?.nama}</span>
              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </Button>
          } items={profileItems} />
        </div>
      </div>
    </header>
  );
}

function RefreshCw({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
}

function Wifi({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13V4a1 1 0 00-1-1h-4a1 1 0 000 2h2.586l-4.707 4.707a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L9.586 7H7a1 1 0 100 2h5.586l4.707 4.707a1 1 0 001.414-1.414l-3-3a1 1 0 000-1.414l3-3a1 1 0 00-1.414-1.414L11.414 9H9a1 1 0 100 2h4" /></svg>;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface-elevated">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogoutRequest={() => setLogoutModalOpen(true)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} onLogoutRequest={() => setLogoutModalOpen(true)} />
        <main className="p-4 lg:p-6 pt-0" role="main">
          {children}
        </main>
      </div>

      <Modal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} title="Keluar & Evaluasi" size="md">
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            Terima kasih telah menggunakan/mencoba KMS Pandawa Berjaya! Sebelum Anda keluar, mohon kesediaannya untuk mengisi survei evaluasi singkat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => {
                window.open('https://docs.google.com/forms/d/e/1FAIpQLScx77tgx-dwE7cXjmnBP2nS1OPHNlufZ3qytmRNr0fUDLVIWw/viewform?usp=dialog', '_blank');
                setLogoutModalOpen(false);
                logout();
              }}
              className="flex-1"
              variant="primary"
            >
              Isi Survei GForm
            </Button>
            <Button
              onClick={() => {
                setLogoutModalOpen(false);
                logout();
              }}
              className="flex-1"
              variant="secondary"
            >
              Tetap Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function PageHeader({ title, subtitle, action, breadcrumbs }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="mb-6 animate-in">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-4" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <svg className="w-4 h-4 mx-1 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-text-primary transition-colors">{crumb.label}</Link>
              ) : (
                <span className="text-text-primary font-medium" aria-current="page">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}