import { useState, useEffect } from 'react';
import { isDemoMode } from '../context/AuthContext';
import { Button } from './ui';
import { ExternalLink, MessageSquare, Check, Copy, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function SurveyButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testActive, setTestActive] = useState(false);

  if (!isDemoMode()) {
    return null;
  }

  // Check if test session is active (has startedAt but not all completed)
  useEffect(() => {
    const checkTestActive = () => {
      try {
        const stored = localStorage.getItem('usabilityTest');
        if (stored) {
          const parsed = JSON.parse(stored);
          const tasks = parsed.tasks || [];
          const started = !!parsed.startedAt;
          const allDone = tasks.length > 0 && tasks.every((t: any) => t.completed);
          setTestActive(started && !allDone);
        }
      } catch {}
    };
    checkTestActive();
    const interval = setInterval(checkTestActive, 1000);
    return () => clearInterval(interval);
  }, []);

  const surveyUrl = import.meta.env.VITE_SURVEY_URL;
  const respondentId = localStorage.getItem('respondentId') || `R${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  const prefillUrl = surveyUrl 
    ? `${surveyUrl}${surveyUrl.includes('?') ? '&' : '?'}entry.740669310=${respondentId}`
    : '';

  const handleOpenSurvey = () => {
    if (!prefillUrl) {
      alert('URL survei belum dikonfigurasi (VITE_SURVEY_URL di environment variables)');
      return;
    }
    window.open(prefillUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (!prefillUrl) return;
    navigator.clipboard.writeText(prefillUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToChecklist = () => {
    window.location.href = '/test';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Back to checklist button (when test active) */}
      {testActive && (
        <div
          className={cn(
            'absolute bottom-0 right-0 w-56 bg-surface border border-border rounded-lg shadow-lg p-3 opacity-0 invisible transition-all duration-200',
            showTooltip ? 'opacity-100 visible translate-y-2' : 'translate-y-0'
          )}
          role="tooltip"
        >
          <div className="space-y-2">
            <Button
              onClick={handleBackToChecklist}
              className="w-full justify-start"
              variant="primary"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Tugas
            </Button>
            <div className="pt-2 border-t border-border text-xs text-text-secondary text-center">
              Melanjutkan sesi pengujian
            </div>
          </div>
          <div className="absolute bottom-0 right-2 w-2 h-2 bg-surface border-b-2 border-r-2 border-border rotate-45" />
        </div>
      )}

      {/* Survey button tooltip */}
      <div
        className={cn(
          'absolute bottom-16 right-0 w-56 bg-surface border border-border rounded-lg shadow-lg p-3 opacity-0 invisible transition-all duration-200',
          showTooltip ? 'opacity-100 visible translate-y-2' : 'translate-y-0'
        )}
        role="tooltip"
      >
        <div className="space-y-2">
          <Button
            onClick={handleOpenSurvey}
            className="w-full justify-start"
            variant="primary"
            size="sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Buka Survei (GForm)
          </Button>
          <Button
            onClick={handleCopyLink}
            className="w-full justify-start"
            variant="secondary"
            size="sm"
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
          <div className="pt-2 border-t border-border text-xs text-text-secondary text-center">
            Prefill ID responden otomatis
          </div>
        </div>
        <div className="absolute bottom-0 right-2 w-2 h-2 bg-surface border-b-2 border-r-2 border-border rotate-45" />
      </div>

      {/* Main floating button */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
          'bg-primary text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'animate-bounce'
        )}
        aria-label="Buka survei usabilitas"
        aria-expanded={showTooltip}
      >
        <MessageSquare className="w-7 h-7" aria-hidden="true" />
      </button>

      {showTooltip && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTooltip(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}