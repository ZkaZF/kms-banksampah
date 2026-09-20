import { Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransaksiPage } from './pages/TransaksiPage';
import { NasabahPortalPage } from './pages/NasabahPortalPage';
import { PublicNasabahPortal } from './pages/PublicNasabahPortal';
import { PublicSOPDetail } from './pages/PublicSOPDetail';

const NasabahPage = lazy(() => import('./pages/NasabahPage').then(m => ({ default: m.NasabahPage })));
const KatalogPage = lazy(() => import('./pages/KatalogPage').then(m => ({ default: m.KatalogPage })));
const SopPage = lazy(() => import('./pages/SopPage').then(m => ({ default: m.SopPage })));
const LaporanPage = lazy(() => import('./pages/LaporanPage').then(m => ({ default: m.LaporanPage })));
const BroadcastPage = lazy(() => import('./pages/BroadcastPage').then(m => ({ default: m.BroadcastPage })));
const ScannerPage = lazy(() => import('./pages/ScannerPage').then(m => ({ default: m.ScannerPage })));

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-surface">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Terjadi Kesalahan</h2>
            <p className="text-text-secondary mb-4">Aplikasi mengalami kesalahan render. Silakan refresh halaman.</p>
            <details className="text-left mb-4 p-4 bg-surface-elevated rounded-lg text-xs text-text-muted overflow-auto max-h-40">
              <summary className="cursor-pointer font-medium mb-2">Detail Error</summary>
              <pre>{this.state.error?.message}</pre>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AdminLayout() {
  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" aria-label="Loading" />
    </div>
  );

  return (
    <Layout>
      <Suspense fallback={loadingFallback}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Public routes */}
      <Route path="/portal/:id" element={<PublicNasabahPortal />} />
      <Route path="/sop/:id" element={<PublicSOPDetail />} />

      {/* Protected admin/petugas routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'petugas']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transaksi" element={<TransaksiPage />} />
          <Route path="/scan" element={<ScannerPage />} />
          <Route path="/nasabah" element={<NasabahPage />} />
          <Route path="/katalog" element={<KatalogPage />} />
          <Route path="/sop" element={<SopPage />} />
          <Route path="/laporan" element={<LaporanPage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
        </Route>
      </Route>

      {/* Protected nasabah routes */}
      <Route element={<ProtectedRoute allowedRoles={['nasabah']} />}>
        <Route path="/portal" element={<NasabahPortalPage />} />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

