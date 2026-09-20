import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { isDemoMode } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  ClipboardList,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  route: string;
  targetTime: string;
  successCriteria: string;
  completed: boolean;
  startTime: number | null;
  endTime: number | null;
}

const TASKS: Task[] = [
  {
    id: '1',
    title: 'Input Transaksi Setor Baru',
    description: 'Scan QR Code nasabah (N001 Budi Santoso), pilih PET 2kg + Kardus 1kg, simpan transaksi, verifikasi saldo terupdate.',
    route: '/transaksi',
    targetTime: '< 60 detik',
    successCriteria: 'Data tersimpan, saldo nasabah update, struk muncul',
    completed: false,
    startTime: null,
    endTime: null,
  },
  {
    id: '2',
    title: 'Cek Saldo Mandiri sebagai Nasabah',
    description: 'Buka portal nasabah publik, lihat saldo & riwayat 3 bulan terakhir, unduh PDF.',
    route: '/portal/N001',
    targetTime: '< 45 detik',
    successCriteria: 'Saldo benar, riwayat lengkap, bisa unduh PDF',
    completed: false,
    startTime: null,
    endTime: null,
  },
  {
    id: '3',
    title: 'Baca SOP Pemilahan PET',
    description: 'Buka library SOP, buka detail PET, baca langkah-langkah pemisahan tutup & label.',
    route: '/sop/S001',
    targetTime: '< 30 detik',
    successCriteria: 'Menemukan SOP < 30 detik, konten jelas, gambar terbuka',
    completed: false,
    startTime: null,
    endTime: null,
  },
  {
    id: '3b',
    title: 'Update Harga Jual Kardus',
    description: 'Buka master katalog, ubah harga Kardus jadi Rp2.200/kg, simpan, verifikasi di input transaksi.',
    route: '/katalog',
    targetTime: '< 45 detik',
    successCriteria: 'Harga update, input transaksi pakai harga baru',
    completed: false,
    startTime: null,
    endTime: null,
  },
  {
    id: '5',
    title: 'Broadcast Notifikasi ke Nasabah',
    description: 'Buat broadcast, pilih template "Saldo Terbaru", target semua nasabah aktif, kirim (anggap terkirim).',
    route: '/broadcast',
    targetTime: '< 3 menit',
    successCriteria: 'Log broadcast muncul, template terisi',
    completed: false,
    startTime: null,
    endTime: null,
  },
];

const STORAGE_KEY = 'usabilityTest';

function loadTestState(): { respondentId: string; tasks: Task[]; startedAt: number | null; consentGiven: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        respondentId: parsed.respondentId || '',
        tasks: parsed.tasks || TASKS,
        startedAt: parsed.startedAt || null,
        consentGiven: parsed.consentGiven || false,
      };
    }
  } catch {}
  return { respondentId: '', tasks: TASKS, startedAt: null, consentGiven: false };
}

function saveTestState(state: { respondentId: string; tasks: Task[]; startedAt: number | null; consentGiven: boolean }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return mins > 0 ? `${mins}m ${remSecs}s` : `${remSecs}s`;
}

export function TestPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [respondentId, setRespondentId] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [started, setStarted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [surveyUrl, setSurveyUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isDemoMode()) {
      navigate('/dashboard');
      return;
    }

    const rid = searchParams.get('rid') || `R${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const loaded = loadTestState();
    setRespondentId(rid);
    setConsentGiven(loaded.consentGiven);
    setStarted(!!loaded.startedAt);
    if (loaded.tasks) setTasks(loaded.tasks);
    if (loaded.startedAt) {
      loaded.tasks.forEach(t => {
        if (t.startTime && !t.endTime) {
          setActiveTaskId(t.id);
        }
      });
    }
    const url = import.meta.env.VITE_SURVEY_URL || '';
    setSurveyUrl(url);
  }, [navigate, searchParams]);

  const handleConsent = () => {
    setConsentGiven(true);
    const state = loadTestState();
    saveTestState({ ...state, consentGiven: true, respondentId });
  };

  const handleStartTest = async () => {
    if (!user) {
      await login('petugas', `Responden ${respondentId}`);
    }
    setStarted(true);
    const now = Date.now();
    const state = loadTestState();
    saveTestState({ ...state, startedAt: now, respondentId });
    // Simpan juga ke key terpisah untuk SurveyButton prefill
    localStorage.setItem('respondentId', respondentId);
  };

  const handleTaskStart = (taskId: string) => {
    const now = Date.now();
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, startTime: now } : t));
    setActiveTaskId(taskId);
    setExpandedTask(taskId);
    const state = loadTestState();
    state.tasks = tasks.map(t => t.id === taskId ? { ...t, startTime: now } : t);
    saveTestState(state);
    navigate(tasks.find(t => t.id === taskId)?.route || '/dashboard');
  };

  const handleTaskComplete = (taskId: string, success: boolean) => {
    const now = Date.now();
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: success, endTime: now };
      }
      return t;
    }));
    setActiveTaskId(null);
    const state = loadTestState();
    state.tasks = tasks.map(t => t.id === taskId ? { ...t, completed: success, endTime: now } : t);
    saveTestState(state);
  };

  const handleOpenSurvey = () => {
    if (!surveyUrl) {
      alert('URL survei belum dikonfigurasi (VITE_SURVEY_URL)');
      return;
    }
    const url = `${surveyUrl}${surveyUrl.includes('?') ? '&' : '?'}entry.740669310=${respondentId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopySurveyLink = () => {
    if (!surveyUrl) return;
    const url = `${surveyUrl}${surveyUrl.includes('?') ? '&' : '?'}entry.740669310=${respondentId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allCompleted = tasks.every(t => t.completed);
  const completedCount = tasks.filter(t => t.completed).length;

  if (!isDemoMode()) {
    return null;
  }

  if (!consentGiven) {
    return (
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <HelpCircle className="w-8 h-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary mb-3">
                Pengujian Usabilitas KMS Bank Sampah Pandawa
              </h1>
              <p className="text-text-secondary text-lg">
                Terima kasih sudah bersedia membantu menguji aplikasi ini.
              </p>
            </div>

            <div className="space-y-4 mb-6 p-4 bg-surface bg-opacity-50 rounded-lg">
              <h3 className="font-semibold text-text-primary">Apa yang akan Anda lakukan:</h3>
              <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
                <li>Mengerjakan 5 tugas simulasi (sekitar 15-20 menit total)</li>
                <li>Aplikasi akan memandu Anda ke halaman yang sesuai</li>
                <li>Setelah selesai, mengisi survei singkat (SUS + rating per tugas)</li>
              </ul>
            </div>

            <div className="space-y-4 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Catatan Penting
              </h3>
              <ul className="space-y-1 text-sm text-amber-700 list-disc list-inside">
                <li>Data uji coba <strong>reset setiap refresh halaman</strong> — jangan refresh saat mengerjakan</li>
                <li>Fitur broadcast & WhatsApp hanya simulasi (tidak benar-benar terkirim)</li>
                <li>Scanner QR butuh izin kamera; bisa input manual kode nasabah (N001-N005)</li>
                <li>Gunakan Chrome/Edge terbaru di HP atau laptop</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleConsent}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                required
              />
              <span className="text-sm text-text-secondary">
                Saya memahami prosedur di atas dan bersedia mengikuti pengujian ini.
                Data saya akan dianonimkan dan hanya digunakan untuk analisis usabilitas.
              </span>
            </label>

            <div className="mt-6 flex gap-3">
              <Input
                label="ID Responden"
                value={respondentId}
                onChange={e => setRespondentId(e.target.value)}
                placeholder="Contoh: R001"
                className="flex-1"
              />
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full mt-6"
              size="lg"
              disabled={!consentGiven || !respondentId.trim()}
            >
              Mulai Pengujian
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Memuat sesi pengujian...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-elevated p-4 pb-32">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-primary">ID Responden: {respondentId}</p>
                <p className="text-xs text-text-secondary">
                  Progress: {completedCount} / {tasks.length} tugas selesai
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">Total Waktu</p>
                <p className="text-lg font-bold text-primary">
                  {tasks.reduce((sum, t) => {
                    if (t.startTime && t.endTime) return sum + (t.endTime - t.startTime);
                    if (t.startTime && t.id === activeTaskId) return sum + (Date.now() - t.startTime);
                    return sum;
                  }, 0) > 0
                    ? formatDuration(
                        tasks.reduce((sum, t) => {
                          if (t.startTime && t.endTime) return sum + (t.endTime - t.startTime);
                          if (t.startTime && t.id === activeTaskId) return sum + (Date.now() - t.startTime);
                          return sum;
                        }, 0)
                      )
                    : '0s'}
                </p>
              </div>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Daftar Tugas
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Klik "Mulai" untuk memulai tugas, aplikasi akan mengarahkan ke halaman yang sesuai.
              Setelah selesai, kembali ke sini dan tandai "Selesai ✓" atau "Gagal ✗".
            </p>
          </div>

          <div className="divide-y divide-border">
            {tasks.map(task => {
              const isActive = activeTaskId === task.id;
              const elapsed = task.startTime
                ? (task.endTime || (isActive ? Date.now() : task.startTime)) - task.startTime
                : 0;
              const Icon = task.completed ? CheckCircle2 : isActive ? Loader2 : Clock;
              const iconColor = task.completed ? 'text-green-500' : isActive ? 'text-primary animate-spin' : 'text-text-muted';

              return (
                <div
                  key={task.id}
                  className={cn(
                    'p-4 transition-all',
                    task.completed ? 'bg-green-50' : isActive ? 'bg-primary/5' : ''
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconColor)}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-text-primary">{task.title}</h3>
                          <p className="text-sm text-text-secondary mt-1">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            task.completed ? 'bg-green-100 text-green-700' :
                            isActive ? 'bg-primary/10 text-primary' :
                            'bg-surface text-text-muted'
                          )}>
                            {task.completed ? 'Selesai' : isActive ? 'Sedang dikerjakan' : 'Belum dimulai'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Target: {task.targetTime}</span>
                        <span className="flex items-center gap-1">
                          {elapsed > 0 ? (
                            <>
                              <Clock className="w-3 h-3" /> Waktu: {formatDuration(elapsed)}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Kriteria: {task.successCriteria}
                            </>
                          )}
                        </span>
                      </div>

                      {expandedTask === task.id && (
                        <div className="mt-3 pt-3 border-t border-border/50 animate-in slide-in-from-top-2">
                          <p className="text-xs text-text-secondary mb-2">
                            Kriteria keberhasilan: <span className="font-medium">{task.successCriteria}</span>
                          </p>
                          {!task.completed && !isActive && (
                            <Button
                              onClick={() => handleTaskStart(task.id)}
                              className="w-full"
                              size="sm"
                            >
                              Mulai Tugas Ini
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          )}
                          {isActive && (
                            <div className="space-y-2">
                              <p className="text-xs text-text-secondary">
                                Anda sedang di halaman tugas ini. Setelah selesai, kembali ke sini.
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleTaskComplete(task.id, true)}
                                  variant="primary"
                                  className="flex-1"
                                  size="sm"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Selesai ✓
                                </Button>
                                <Button
                                  onClick={() => handleTaskComplete(task.id, false)}
                                  variant="secondary"
                                  className="flex-1"
                                  size="sm"
                                >
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Gagal ✗
                                </Button>
                              </div>
                            </div>
                          )}
                          {task.completed && (
                            <div className="flex items-center gap-2 text-green-700 text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                {task.endTime && task.startTime
                                  ? `Selesai dalam ${formatDuration(task.endTime - task.startTime)}`
                                  : 'Tugas diselesaikan'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {!expandedTask && !task.completed && !isActive && (
                        <Button
                          onClick={() => setExpandedTask(task.id)}
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-left"
                        >
                          Lihat detail
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {allCompleted && (
          <Card className="bg-green-50 border-green-200">
            <div className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">Semua Tugas Selesai!</h3>
              <p className="text-green-700 mb-6">
                Terima kasih telah menyelesaikan 5 tugas simulasi.
                Silakan isi survei usabilitas untuk memberikan masukan Anda.
              </p>

              {surveyUrl ? (
                <div className="space-y-3">
                  <Button
                    onClick={handleOpenSurvey}
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Isi Survei Usabilitas (GForm)
                  </Button>
                  <Button
                    onClick={handleCopySurveyLink}
                    variant="secondary"
                    className="w-full"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Link disalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Salin Link Survei
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <p className="font-medium">URL survei belum dikonfigurasi.</p>
                  <p className="mt-1">Setel <code>VITE_SURVEY_URL</code> di environment variables Vercel.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {!allCompleted && (
          <Card className="bg-surface border-border/50">
            <div className="p-4">
              <p className="text-sm text-text-secondary text-center">
                Selesaikan semua tugas di atas untuk membuka survei usabilitas.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}