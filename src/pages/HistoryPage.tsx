import { useState, useMemo, useEffect } from 'react';
import { getHistory, clearHistory } from '@/lib/urlAnalyzer';
import { fetchFromFirebase } from '@/lib/firebase';
import type { FirebaseURLCheck } from '@/lib/firebase';
import { Trash2, Search, RefreshCw, Database } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState(() => getHistory());
  const [filter, setFilter] = useState('');
  const [firebaseData, setFirebaseData] = useState<(FirebaseURLCheck & { firebaseKey: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'firebase' | 'local'>('firebase');

  const loadFirebase = async () => {
    setLoading(true);
    try {
      const data = await fetchFromFirebase();
      setFirebaseData(data);
    } catch (err) {
      console.error('Failed to load Firebase data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFirebase(); }, []);

  const filteredLocal = useMemo(() => {
    if (!filter) return history;
    const q = filter.toLowerCase();
    return history.filter(r => r.url.toLowerCase().includes(q) || r.prediction.toLowerCase().includes(q));
  }, [history, filter]);

  const filteredFirebase = useMemo(() => {
    if (!filter) return firebaseData;
    const q = filter.toLowerCase();
    return firebaseData.filter(r => r.url.toLowerCase().includes(q) || r.status.toLowerCase().includes(q));
  }, [firebaseData, filter]);

  const handleClear = () => { clearHistory(); setHistory([]); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Scan History</h1>
        <div className="flex items-center gap-3">
          <button onClick={loadFirebase} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {tab === 'local' && history.length > 0 && (
            <button onClick={handleClear} className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition">
              <Trash2 className="w-3.5 h-3.5" /> Clear Local
            </button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('firebase')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'firebase' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
        >
          <Database className="w-3.5 h-3.5" /> Firebase Database
        </button>
        <button
          onClick={() => setTab('local')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'local' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
        >
          Local History
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by URL or status…"
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {tab === 'firebase' ? (
        loading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">Loading Firebase data…</div>
        ) : filteredFirebase.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">No scans stored in Firebase yet.</div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFirebase.map(r => (
                    <tr key={r.firebaseKey} className={`border-b border-border/50 hover:bg-secondary/20 transition ${r.status === 'SUSPICIOUS' ? 'bg-destructive/10' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[350px]">{r.url}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${r.risk_score > 70 ? 'text-destructive' : 'text-accent'}`}>{r.risk_score}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.status === 'SUSPICIOUS'
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-accent/20 text-accent'
                        }`}>
                          {r.status === 'SUSPICIOUS' ? '🔴 SUSPICIOUS' : '🟢 SAFE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        filteredLocal.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            {history.length === 0 ? 'No local scan history yet.' : 'No results match your filter.'}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prediction</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trust</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocal.map(r => (
                    <tr key={r.id} className={`border-b border-border/50 hover:bg-secondary/20 transition ${r.riskScore > 70 ? 'bg-destructive/5' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs truncate max-w-[300px]">{r.url}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          r.prediction === 'Phishing' ? 'bg-destructive/15 text-destructive' :
                          r.prediction === 'Defacement' ? 'bg-[hsl(38_92%_50%/0.15)] text-[hsl(38_92%_50%)]' :
                          'bg-accent/15 text-accent'
                        }`}>{r.prediction}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${r.riskScore >= 70 ? 'text-destructive' : r.riskScore >= 40 ? 'text-[hsl(38_92%_50%)]' : 'text-accent'}`}>{r.riskScore}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{r.trustLevel}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
