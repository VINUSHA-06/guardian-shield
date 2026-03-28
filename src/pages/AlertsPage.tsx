import { useMemo } from 'react';
import { getAlerts } from '@/lib/urlAnalyzer';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function AlertsPage() {
  const alerts = useMemo(() => getAlerts(), []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-destructive" />
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">High Risk Alerts</h1>
        {alerts.length > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs font-bold">{alerts.length}</span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No high-risk alerts. URLs with risk score &gt; 70 will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(r => (
            <div key={r.id} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 pulse-danger flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-mono text-sm truncate text-foreground">{r.url}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-bold text-destructive text-sm">Score: {r.riskScore}</span>
                  <span>{r.prediction}</span>
                  <span>{new Date(r.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.attackStory}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
