import { useMemo } from 'react';
import { getHistory, detectPatterns, detectEvolutions } from '@/lib/urlAnalyzer';
import { Network, AlertTriangle, GitCompare } from 'lucide-react';

export default function PatternsPage() {
  const history = useMemo(() => getHistory(), []);
  const patterns = useMemo(() => detectPatterns(history), [history]);
  const evolutions = useMemo(() => detectEvolutions(history), [history]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Attack Patterns</h1>

      {/* Campaign detection */}
      <div className={`rounded-xl border p-6 space-y-4 ${patterns.campaign ? 'border-destructive/50 bg-destructive/5 danger-glow' : 'border-border bg-card'}`}>
        <div className="flex items-center gap-2">
          {patterns.campaign ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <Network className="w-5 h-5 text-muted-foreground" />}
          <h2 className="text-lg font-bold text-foreground">Campaign Detection</h2>
        </div>
        <p className={`text-sm ${patterns.campaign ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{patterns.message}</p>
        {patterns.campaign && (
          <>
            {patterns.commonKeywords.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase">Common Keywords: </span>
                <span className="text-sm text-foreground">{patterns.commonKeywords.join(', ')}</span>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Involved URLs ({patterns.urls.length}): </span>
              <ul className="mt-1 space-y-1">
                {patterns.urls.map((u, i) => <li key={i} className="font-mono text-xs text-destructive truncate">{u}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* URL Evolution */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">URL Evolution Tracker</h2>
        </div>
        {evolutions.pairs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No similar URL variations detected yet. Scan more URLs to detect evolution patterns.</p>
        ) : (
          <div className="space-y-2">
            {evolutions.pairs.map(([a, b, sim], i) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs truncate">{a}</p>
                  <p className="font-mono text-xs truncate text-muted-foreground">{b}</p>
                </div>
                <span className="text-xs font-bold text-primary shrink-0">{Math.round(sim * 100)}% similar</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
