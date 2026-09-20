import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/layout/Layout';
import { Card, Button, Badge, Textarea, Alert, Modal } from '../components/ui';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { formatRupiah, cn } from '../lib/utils';
import { 
  Send, 
  Users, 
  Eye, 
  Copy,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';

const TEMPLATE_OPTIONS = [
  { value: 'saldo', label: 'Notifikasi Saldo', icon: '💰' },
  { value: 'harga', label: 'Update Harga Jual', icon: '📋' },
  { value: 'jadwal', label: 'Jadwal Penjemputan', icon: '📅' },
  { value: 'sop', label: 'SOP/Panduan Baru', icon: '📖' },
  { value: 'custom', label: 'Kustom', icon: '✏️' },
];

const TEMPLATE_CONTENT: Record<string, string> = {
  saldo: `Halo {nama}, saldo tabungan sampah Anda saat ini: Rp {saldo}. Riwayat setoran: {link_portal}. Terima kasih sudah menabung sampah! — Bank Sampah Pandawa Berjaya`,
  harga: `Halo {nama}, info update harga jual sampah terbaru: {detail_harga}. Cek lengkap di {link_portal}. — Bank Sampah Pandawa Berjaya`,
  jadwal: `Halo {nama}, jadwal penjemputan sampah minggu ini: {detail_jadwal}. Pastikan sampah sudah dipilah ya! — Bank Sampah Pandawa Berjaya`,
  sop: `Halo {nama}, ada panduan pemilahan baru: {judul_sop}. Baca selengkapnya: {link_sop}. — Bank Sampah Pandawa Berjaya`,
  custom: '',
};

const TARGET_FILTERS = [
  { value: 'all', label: 'Semua Nasabah Aktif', icon: Users },
  { value: 'has_saldo', label: 'Saldo > Rp 0', icon: Users },
  { value: 'saldo_100k', label: 'Saldo > Rp 100.000', icon: Users },
  { value: 'rt01', label: 'RT 01', icon: Users },
  { value: 'rt02', label: 'RT 02', icon: Users },
  { value: 'rt03', label: 'RT 03', icon: Users },
  { value: 'custom', label: 'Pilih Manual', icon: Users },
];

export function BroadcastPage() {
  const { nasabahList, addBroadcastLog } = useData();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [template, setTemplate] = useState<'saldo' | 'harga' | 'jadwal' | 'sop' | 'custom'>('saldo');
  const [message, setMessage] = useState(TEMPLATE_CONTENT.saldo);
  const [targetFilter, setTargetFilter] = useState<'all' | 'has_saldo' | 'saldo_100k' | 'rt01' | 'rt02' | 'rt03' | 'custom'>('all');
  const [selectedNasabah, setSelectedNasabah] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<{ portal: boolean; sop: boolean; jadwal: boolean }>({ portal: true, sop: false, jadwal: false });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [previewModal, setPreviewModal] = useState(false);

  const filteredNasabah = useMemo(() => {
    let result = nasabahList.filter(n => {
      if (targetFilter === 'all') return true;
      if (targetFilter === 'has_saldo') return n.saldo > 0;
      if (targetFilter === 'saldo_100k') return n.saldo > 100000;
      if (targetFilter === 'rt01') return n.rt === '01';
      if (targetFilter === 'rt02') return n.rt === '02';
      if (targetFilter === 'rt03') return n.rt === '03';
      return false;
    });

    if (targetFilter === 'custom') {
      result = result.filter(n => selectedNasabah.has(n.id));
    }
    return result;
  }, [nasabahList, targetFilter, selectedNasabah]);

  const handleTemplateChange = (value: typeof template) => {
    setTemplate(value);
    if (value !== 'custom') {
      setMessage(TEMPLATE_CONTENT[value]);
    }
  };

  const getTargetCount = () => filteredNasabah.length;

  const handleSend = async () => {
    if (!message.trim()) { alert('Pesan tidak boleh kosong'); return; }
    if (getTargetCount() === 0) { alert('Tidak ada nasabah target'); return; }

    setSending(true);
    const errors: string[] = [];
    let success = 0;

    for (const nasabah of filteredNasabah) {
      try {
        let personalizedMessage = message
          .replace('{nama}', nasabah.nama)
          .replace('{saldo}', formatRupiah(nasabah.saldo))
          .replace('{link_portal}', 'https://pandawa-berjaya.vercel.app/portal/' + nasabah.id)
          .replace('{link_sop}', 'https://pandawa-berjaya.vercel.app/sop')
          .replace('{detail_harga}', 'PET Rp3.500/kg, Kardus Rp2.000/kg, Logam Rp8.000/kg')
          .replace('{detail_jadwal}', 'Senin & Kamis pukul 08:00-10:00')
          .replace('{judul_sop}', 'Kriteria PET Bottle Grade A');

        // Simulate WA API call (replace with actual Fonnte/WhatsApp API)
        await new Promise(r => setTimeout(r, 100));
        
        console.log(`[WA] To: ${nasabah.noWhatsApp || 'N/A'} - ${personalizedMessage}`);
        success++;
      } catch (err) {
        errors.push(`${nasabah.nama}: ${err}`);
      }
    }

    // Log broadcast
    await addBroadcastLog({
      template: message,
      targetFilter,
      targetCount: filteredNasabah.length,
      sentCount: success,
      failedCount: errors.length,
      sentBy: user?.uid || 'admin',
    });

    setSendResult({ success, failed: errors.length, errors });
    setSending(false);
    setStep(3);
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    alert('Pesan disalin ke clipboard');
  };

  const targetNasabah = filteredNasabah;

  return (
    <>
      <PageHeader
        title="Broadcast WhatsApp"
        subtitle="Kirim notifikasi saldo, harga, jadwal, dan SOP ke nasabah via WhatsApp"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Broadcast' }]}
      />

      <Alert variant="info">
        <strong>Mode Demo:</strong> Pengiriman WhatsApp disimulasikan. Integrasikan dengan Fonnte/Wablas API untuk produksi.
      </Alert>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center gap-4">
          {[
            { num: 1, label: 'Template', desc: 'Pilih template pesan' },
            { num: 2, label: 'Target', desc: 'Pilih penerima' },
            { num: 3, label: 'Kirim', desc: 'Konfirmasi & kirim' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  step > s.num ? 'bg-success text-white' : step === s.num ? 'bg-primary text-white' : 'bg-surface-elevated border border-border text-text-muted'
                )}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-text-primary">{s.label}</p>
                  <p className="text-[10px] text-text-muted">{s.desc}</p>
                </div>
              </div>
              {i < 2 && <div className={cn('flex-1 h-0.5', step > i + 1 ? 'bg-success' : 'bg-border')} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Template */}
        {step === 1 && (
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">1. Pilih Template Pesan</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  onClick={() => handleTemplateChange(t.value as typeof template)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left group',
                    template === t.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    <span className="font-medium text-text-primary">{t.label}</span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {TEMPLATE_CONTENT[t.value] || 'Tulis pesan sendiri'}
                  </p>
                </button>
              ))}
            </div>

            <Textarea
              label="Isi Pesan"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tulis pesan Anda... Gunakan {nama}, {saldo}, {link_portal}, {link_sop} untuk variabel dinamis"
              rows={6}
              className="mt-4"
            />

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
              <Badge variant="neutral" className="gap-1"><span>{'{'}</span>nama<span>{'}'}</span></Badge> Nama nasabah
              <Badge variant="neutral" className="gap-1"><span>{'{'}</span>saldo<span>{'}'}</span></Badge> Saldo otomatis
              <Badge variant="neutral" className="gap-1"><span>{'{'}</span>link_portal<span>{'}'}</span></Badge> Link portal nasabah
              <Badge variant="neutral" className="gap-1"><span>{'{'}</span>link_sop<span>{'}'}</span></Badge> Link SOP digital
            </div>

            <div className="mt-4 flex gap-3">
              <Button onClick={copyMessage} variant="ghost" leftIcon={<Copy className="w-4 h-4" />}>Salin Pesan</Button>
              <Button onClick={() => setStep(2)} variant="primary" className="ml-auto">Lanjut: Pilih Target →</Button>
            </div>
          </Card>
        )}

        {/* Step 2: Target */}
        {step === 2 && (
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">2. Pilih Target Penerima</h3>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
              {TARGET_FILTERS.map(f => (
                <label key={f.value} className={cn(
                  'p-3 rounded-lg border-2 cursor-pointer transition-all',
                  targetFilter === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}>
                  <input
                    type="radio"
                    name="targetFilter"
                    value={f.value}
                    checked={targetFilter === f.value}
                    onChange={() => { setTargetFilter(f.value as typeof targetFilter); setSelectedNasabah(new Set()); }}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <f.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-text-primary">{f.label}</span>
                  </div>
                </label>
              ))}
            </div>

            {targetFilter === 'custom' && (
              <div className="mb-4 p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
                <h4 className="font-medium text-text-primary mb-3">Pilih Nasabah Manual</h4>
                <div className="grid gap-2 max-h-60 overflow-y-auto scrollbar-thin">
                  {nasabahList.map(n => (
                    <label key={n.id} className={cn(
                      'flex items-center gap-3 p-2 rounded border transition-colors cursor-pointer',
                      selectedNasabah.has(n.id) ? 'bg-primary/5 border-primary' : 'border-transparent hover:border-border'
                    )}>
                      <input
                        type="checkbox"
                        checked={selectedNasabah.has(n.id)}
                        onChange={(e) => {
                          const next = new Set(selectedNasabah);
                          if (e.target.checked) next.add(n.id);
                          else next.delete(n.id);
                          setSelectedNasabah(next);
                        }}
                        className="w-4 h-4 text-primary rounded border-border"
                      />
                      <span className="text-sm text-text-primary">{n.nama}</span>
                      <span className="text-xs text-text-muted ml-auto">RT {n.rt}/RW {n.rw}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 p-4 bg-info/5 border border-info/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-info">Target Penerima: <span className="text-primary">{getTargetCount()}</span> nasabah</p>
                  <p className="text-sm text-text-secondary mt-1">Estimasi waktu kirim: ~{Math.ceil(getTargetCount() * 0.5)} detik</p>
                </div>
                <Button variant="secondary" onClick={() => setPreviewModal(true)} leftIcon={<Eye className="w-4 h-4" />}>
                  Pratinjau
                </Button>
              </div>
            </div>

            <div className="mb-4 p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
              <h4 className="font-medium text-text-primary mb-3">Lampiran Otomatis</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={attachments.portal} onChange={e => setAttachments(p => ({ ...p, portal: e.target.checked }))} className="w-4 h-4 text-primary rounded border-border" />
                  <span className="text-sm text-text-primary">Link Portal Nasabah</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={attachments.sop} onChange={e => setAttachments(p => ({ ...p, sop: e.target.checked }))} className="w-4 h-4 text-primary rounded border-border" />
                  <span className="text-sm text-text-primary">Link SOP Digital</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={attachments.jadwal} onChange={e => setAttachments(p => ({ ...p, jadwal: e.target.checked }))} className="w-4 h-4 text-primary rounded border-border" />
                  <span className="text-sm text-text-primary">Jadwal Penjemputan</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>← Kembali</Button>
              <Button onClick={() => setStep(3)} variant="primary" className="ml-auto" disabled={getTargetCount() === 0}>
                Lanjut: Konfirmasi & Kirim →
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Confirm & Send */}
        {step === 3 && (
          <Card>
            <h3 className="font-semibold text-text-primary mb-4">3. Konfirmasi & Kirim</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-surface-elevated/50 rounded-lg border border-border/50">
                <h4 className="font-medium text-text-primary mb-3">Ringkasan</h4>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div><span className="text-text-secondary">Template: </span><span className="font-medium capitalize">{template}</span></div>
                  <div><span className="text-text-secondary">Target: </span><span className="font-medium text-primary">{getTargetCount()} nasabah</span></div>
                  <div><span className="text-text-secondary">Dikirim oleh: </span><span className="font-medium">{user?.nama}</span></div>
                  <div><span className="text-text-secondary">Lampiran: </span><span className="font-medium">
                    {attachments.portal && 'Portal '}{attachments.sop && 'SOP '}{attachments.jadwal && 'Jadwal '}
                  </span></div>
                </div>
              </div>

              <div className="p-4 bg-surface-elevated/50 rounded-lg border border-border/50 max-h-48 overflow-y-auto">
                <h4 className="font-medium text-text-primary mb-2">Pratinjau Pesan (nasabah pertama):</h4>
                {targetNasabah[0] && (
                  <pre className="text-sm text-text-secondary whitespace-pre-wrap bg-surface p-3 rounded border border-border/50">
                    {message
                      .replace('{nama}', targetNasabah[0].nama)
                      .replace('{saldo}', formatRupiah(targetNasabah[0].saldo))
                      .replace('{link_portal}', 'https://pandawa-berjaya.vercel.app/portal/' + targetNasabah[0].id)
                      .replace('{link_sop}', 'https://pandawa-berjaya.vercel.app/sop')
                      .replace('{detail_harga}', 'PET Rp3.500/kg, Kardus Rp2.000/kg, Logam Rp8.000/kg')
                      .replace('{detail_jadwal}', 'Senin & Kamis pukul 08:00-10:00')
                      .replace('{judul_sop}', 'Kriteria PET Bottle Grade A')}
                  </pre>
                )}
              </div>
            </div>

            {sendResult && (
              <Modal isOpen={true} onClose={() => { setSendResult(null); setStep(1); setMessage(TEMPLATE_CONTENT.saldo); setTemplate('saldo'); setTargetFilter('all'); setSelectedNasabah(new Set()); }} title="Hasil Pengiriman" size="md">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <Check className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-success">{sendResult.success} Pesan Terkirim</p>
                      <p className="text-sm text-text-secondary">{sendResult.failed} Gagal</p>
                    </div>
                  </div>
                  {sendResult.errors.length > 0 && (
                    <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
                      <p className="font-medium text-error mb-2">Error:</p>
                      <ul className="text-sm text-text-secondary space-y-1">
                        {sendResult.errors.slice(0, 5).map((e, i) => <li key={i} className="flex items-center gap-2"><X className="w-4 h-4 text-error" />{e}</li>)}
                        {sendResult.errors.length > 5 && <li className="text-text-muted">...dan {sendResult.errors.length - 5} error lainnya</li>}
                      </ul>
                    </div>
                  )}
                  <Button onClick={() => { setSendResult(null); setStep(1); setMessage(TEMPLATE_CONTENT.saldo); setTemplate('saldo'); setTargetFilter('all'); setSelectedNasabah(new Set()); }} className="w-full" variant="primary">Selesai</Button>
                </div>
              </Modal>
            )}

            {!sendResult && (
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>← Kembali</Button>
                <Button onClick={handleSend} variant="primary" loading={sending} className="ml-auto" leftIcon={<Send className="w-4 h-4" />}>
                  {sending ? 'Mengirim...' : 'Kirim Sekarang'}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Preview Modal */}
        <Modal isOpen={previewModal} onClose={() => setPreviewModal(false)} title="Pratinjau Pesan ke Semua Target" size="lg">
          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {targetNasabah.slice(0, 10).map((n, i) => (
              <div key={n.id} className="p-3 bg-surface-elevated/50 rounded-lg border border-border/50">
                <p className="font-medium text-text-primary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">{i + 1}</span>
                  {n.nama} ({n.noWhatsApp || 'No WA tidak tersedia'})
                </p>
                <pre className="text-sm text-text-secondary whitespace-pre-wrap mt-2 bg-surface p-2 rounded border border-border/50">
                  {message
                    .replace('{nama}', n.nama)
                    .replace('{saldo}', formatRupiah(n.saldo))
                    .replace('{link_portal}', 'https://pandawa-berjaya.vercel.app/portal/' + n.id)
                    .replace('{link_sop}', 'https://pandawa-berjaya.vercel.app/sop')
                    .replace('{detail_harga}', 'PET Rp3.500/kg, Kardus Rp2.000/kg, Logam Rp8.000/kg')
                    .replace('{detail_jadwal}', 'Senin & Kamis pukul 08:00-10:00')
                    .replace('{judul_sop}', 'Kriteria PET Bottle Grade A')}
                </pre>
              </div>
            ))}
            {targetNasabah.length > 10 && (
              <p className="text-center text-text-muted py-4">...dan {targetNasabah.length - 10} nasabah lainnya</p>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}