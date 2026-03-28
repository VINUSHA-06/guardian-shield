import { useState } from 'react';
import { analyzeURL, saveToHistory } from '@/lib/urlAnalyzer';
import type { AnalysisResult } from '@/lib/urlAnalyzer';
import AnalysisCard from '@/components/AnalysisCard';
import { Search, ShieldCheck } from 'lucide-react';

export default function ScannerPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    if (!url.trim()) return;
    setScanning(true);
    setResult(null);
    // Simulate analysis delay
    await new Promise(r => setTimeout(r, 1200));
    const res = analyzeURL(url.trim());
    saveToHistory(res);
    setResult(res);
    setScanning(false);

    if (res.riskScore > 70) {
      window.alert(`⚠️ HIGH RISK URL DETECTED!\n\nRisk Score: ${res.riskScore}/100\nPrediction: ${res.prediction}\n\nThis link may be a phishing attack. Proceed with extreme caution!`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> AI-Powered Threat Intelligence
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">URL Threat Scanner</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Analyze any URL for phishing, defacement, and social engineering threats with advanced heuristic detection.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder="Enter URL to scan (e.g., suspicious-login.example.com)"
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <button
          onClick={handleScan}
          disabled={scanning || !url.trim()}
          className="h-11 px-6 rounded-lg font-semibold text-sm btn-cyber text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {scanning ? 'Scanning…' : 'Scan'}
        </button>
      </div>

      {scanning && (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
          <div className="h-1.5 w-48 mx-auto bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary scan-line rounded-full" />
          </div>
          <p className="text-sm text-muted-foreground">Analyzing threat vectors…</p>
        </div>
      )}

      {result && <AnalysisCard result={result} />}
    </div>
  );
}
