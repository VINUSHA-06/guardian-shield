import { AnalysisResult } from '@/lib/urlAnalyzer';
import RiskGauge from './RiskGauge';
import { Shield, ShieldAlert, AlertTriangle, Eye, Link2, Fingerprint, BookOpen } from 'lucide-react';

function Badge({ label, value, variant }: { label: string; value: string; variant: 'safe' | 'warn' | 'danger' }) {
  const cls = variant === 'danger' ? 'bg-destructive/15 text-destructive border-destructive/30' : variant === 'warn' ? 'bg-[hsl(38_92%_50%/0.15)] text-[hsl(38_92%_50%)] border-[hsl(38_92%_50%/0.3)]' : 'bg-accent/15 text-accent border-accent/30';
  return (
    <div className={`rounded-lg border px-3 py-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70 mb-0.5">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

export default function AnalysisCard({ result }: { result: AnalysisResult }) {
  const { riskScore } = result;
  const glow = riskScore >= 70 ? 'danger-glow' : riskScore >= 40 ? '' : 'safe-glow';

  return (
    <div className={`rounded-xl border border-border bg-card p-6 space-y-6 ${glow}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {riskScore >= 70 ? <ShieldAlert className="w-5 h-5 text-destructive" /> : riskScore >= 40 ? <AlertTriangle className="w-5 h-5 text-[hsl(38_92%_50%)]" /> : <Shield className="w-5 h-5 text-accent" />}
            <span className={`text-xs font-bold uppercase tracking-wider ${riskScore >= 70 ? 'text-destructive' : riskScore >= 40 ? 'text-[hsl(38_92%_50%)]' : 'text-accent'}`}>{result.prediction}</span>
          </div>
          <p className="font-mono text-sm truncate text-muted-foreground">{result.url}</p>
          {!result.isReachable && <p className="text-xs text-destructive mt-1 font-medium">⚠ Domain does not exist or is unreachable — Unsafe</p>}
        </div>
        <RiskGauge score={riskScore} />
      </div>

      {/* Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Badge label="Trust" value={result.trustLevel} variant={result.trustLevel === 'LOW' ? 'danger' : 'safe'} />
        <Badge label="Redirect" value={result.redirectIntent} variant={result.redirectIntent === 'SUSPICIOUS' ? 'warn' : 'safe'} />
        <Badge label="Mismatch" value={result.contentMismatch} variant={result.contentMismatch === 'HIGH' ? 'danger' : 'safe'} />
        <Badge label="Complexity" value={result.attackComplexity} variant={result.attackComplexity === 'HIGH' ? 'danger' : result.attackComplexity === 'MEDIUM' ? 'warn' : 'safe'} />
      </div>

      {/* Psychology */}
      {result.psychologyTactics.length > 0 && (
        <div className="flex items-start gap-2">
          <Eye className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-destructive uppercase">Psychology Tactics: </span>
            <span className="text-sm text-muted-foreground">{result.psychologyTactics.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Keywords */}
      {result.features.suspiciousKeywords.length > 0 && (
        <div className="flex items-start gap-2">
          <Fingerprint className="w-4 h-4 text-[hsl(38_92%_50%)] mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-[hsl(38_92%_50%)] uppercase">Suspicious Keywords: </span>
            <span className="text-sm text-muted-foreground">{result.features.suspiciousKeywords.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {[
          ['Length', result.features.length],
          ['Dots', result.features.dots],
          ['Entropy', result.features.entropy.toFixed(2)],
          ['Subdomains', result.features.subdomainCount],
          ['Specials', result.features.specialChars],
          ['HTTPS', result.features.hasHttps ? '✓' : '✗'],
        ].map(([l, v]) => (
          <div key={String(l)} className="bg-secondary/50 rounded-lg px-2 py-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="text-sm font-bold text-foreground">{v}</div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="flex items-start gap-2 bg-secondary/30 rounded-lg p-3">
        <BookOpen className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground leading-relaxed">{result.attackStory}</p>
      </div>
    </div>
  );
}
