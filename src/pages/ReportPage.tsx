import { useState, useEffect } from 'react';
import { getHistory } from '@/lib/urlAnalyzer';
import type { AnalysisResult } from '@/lib/urlAnalyzer';
import { FileDown, FileText, ShieldAlert, ShieldCheck } from 'lucide-react';

function getRiskColor(score: number) {
  if (score >= 70) return 'text-red-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
}

function generateTextReport(results: AnalysisResult[]): string {
  const lines: string[] = [];
  lines.push('═══════════════════════════════════════════════════');
  lines.push('       ThreatLens AI — Full Analysis Report');
  lines.push(`       Generated: ${new Date().toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Total URLs Scanned: ${results.length}`);
  const phishing = results.filter(r => r.prediction === 'Phishing').length;
  const defacement = results.filter(r => r.prediction === 'Defacement').length;
  const benign = results.filter(r => r.prediction === 'Benign').length;
  lines.push(`Phishing: ${phishing}  |  Defacement: ${defacement}  |  Benign: ${benign}`);
  const avgRisk = results.length ? Math.round(results.reduce((s, r) => s + r.riskScore, 0) / results.length) : 0;
  lines.push(`Average Risk Score: ${avgRisk}/100`);
  lines.push('');

  results.forEach((r, i) => {
    lines.push(`───────────────────────────────────────────────────`);
    lines.push(`#${i + 1}  ${r.url}`);
    lines.push(`    Scanned: ${new Date(r.timestamp).toLocaleString()}`);
    lines.push(`    Prediction: ${r.prediction}   |   Risk Score: ${r.riskScore}/100`);
    lines.push(`    Trust Level: ${r.trustLevel}   |   Redirect Intent: ${r.redirectIntent}`);
    lines.push(`    Content Mismatch: ${r.contentMismatch}   |   Attack Complexity: ${r.attackComplexity}`);
    lines.push(`    HTTPS: ${r.features.hasHttps ? 'Yes' : 'No'}   |   Entropy: ${r.features.entropy.toFixed(2)}`);
    if (r.psychologyTactics.length) {
      lines.push(`    Psychology Tactics: ${r.psychologyTactics.join(', ')}`);
    }
    if (r.features.suspiciousKeywords.length) {
      lines.push(`    Suspicious Keywords: ${r.features.suspiciousKeywords.join(', ')}`);
    }
    lines.push(`    Attack Story: ${r.attackStory}`);
    lines.push('');
  });

  lines.push('═══════════════════════════════════════════════════');
  lines.push('               End of Report');
  lines.push('═══════════════════════════════════════════════════');
  return lines.join('\n');
}

export default function ReportPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setResults(getHistory());
  }, []);

  const downloadReport = () => {
    const text = generateTextReport(results);
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `threatlens-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const highRisk = results.filter(r => r.riskScore >= 70);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Analysis Report</h1>
        </div>
        <button
          onClick={downloadReport}
          disabled={results.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-40"
        >
          <FileDown className="w-4 h-4" />
          Download Report
        </button>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No scans yet. Scan some URLs first to generate a report.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-card border border-border rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{results.length}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{highRisk.length}</p>
              <p className="text-xs text-muted-foreground">High Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {results.filter(r => r.riskScore >= 40 && r.riskScore < 70).length}
              </p>
              <p className="text-xs text-muted-foreground">Medium Risk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {results.filter(r => r.riskScore < 40).length}
              </p>
              <p className="text-xs text-muted-foreground">Safe</p>
            </div>
          </div>

          {/* Individual Results */}
          {results.map((r, i) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  {r.riskScore >= 70 ? (
                    <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                  )}
                  <span className="font-mono text-sm text-foreground truncate">{r.url}</span>
                </div>
                <span className={`text-lg font-bold ${getRiskColor(r.riskScore)}`}>
                  {r.riskScore}/100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <span className="text-muted-foreground">Prediction: <span className="text-foreground">{r.prediction}</span></span>
                <span className="text-muted-foreground">Trust: <span className="text-foreground">{r.trustLevel}</span></span>
                <span className="text-muted-foreground">Redirect: <span className="text-foreground">{r.redirectIntent}</span></span>
                <span className="text-muted-foreground">Complexity: <span className="text-foreground">{r.attackComplexity}</span></span>
              </div>
              <p className="text-sm text-muted-foreground italic">{r.attackStory}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
