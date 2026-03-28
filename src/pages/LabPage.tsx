import { useState } from 'react';
import { analyzeURL, saveToHistory, detectPatterns } from '@/lib/urlAnalyzer';
import type { AnalysisResult } from '@/lib/urlAnalyzer';
import AnalysisCard from '@/components/AnalysisCard';
import { FlaskConical, Plus, Trash2, Play, AlertTriangle } from 'lucide-react';

export default function LabPage() {
  const [urls, setUrls] = useState<string[]>(['']);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [scanning, setScanning] = useState(false);

  const addUrl = () => setUrls(p => [...p, '']);
  const removeUrl = (i: number) => setUrls(p => p.filter((_, idx) => idx !== i));
  const updateUrl = (i: number, v: string) => setUrls(p => p.map((u, idx) => idx === i ? v : u));

  const handleScanAll = async () => {
    const valid = urls.filter(u => u.trim());
    if (valid.length === 0) return;
    setScanning(true);
    setResults([]);
    await new Promise(r => setTimeout(r, 800));
    const res = valid.map(u => {
      const r = analyzeURL(u.trim());
      saveToHistory(r);
      return r;
    });
    setResults(res);
    setScanning(false);

    const highRisk = res.filter(r => r.riskScore > 70);
    if (highRisk.length > 0) {
      window.alert(`⚠️ ${highRisk.length} HIGH RISK URL(s) DETECTED!\n\n${highRisk.map(r => `${r.url} → Score: ${r.riskScore}`).join('\n')}`);
    }
  };

  const patterns = results.length >= 2 ? detectPatterns(results) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Lab Mode</h1>
      </div>
      <p className="text-sm text-muted-foreground">Analyze multiple URLs at once. Compare results and detect shared attack patterns.</p>

      <div className="space-y-2">
        {urls.map((u, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={u}
              onChange={e => updateUrl(i, e.target.value)}
              placeholder={`URL #${i + 1}`}
              className="flex-1 h-10 px-3 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {urls.length > 1 && (
              <button onClick={() => removeUrl(i)} className="h-10 w-10 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive transition">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={addUrl} className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition">
          <Plus className="w-4 h-4" /> Add URL
        </button>
        <button onClick={handleScanAll} disabled={scanning} className="flex items-center gap-1.5 h-9 px-6 rounded-lg font-semibold text-sm btn-cyber text-primary-foreground disabled:opacity-40">
          <Play className="w-4 h-4" /> {scanning ? 'Scanning…' : 'Scan All'}
        </button>
      </div>

      {patterns?.campaign && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 danger-glow flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">{patterns.message}</p>
            {patterns.commonKeywords.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Common keywords: {patterns.commonKeywords.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {results.map(r => <AnalysisCard key={r.id} result={r} />)}
      </div>
    </div>
  );
}
