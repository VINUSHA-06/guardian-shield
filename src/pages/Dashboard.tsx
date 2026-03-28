import { getHistory } from '@/lib/urlAnalyzer';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

export default function DashboardPage() {
  const history = useMemo(() => getHistory(), []);
  const total = history.length;
  const phishing = history.filter(r => r.prediction === 'Phishing').length;
  const defacement = history.filter(r => r.prediction === 'Defacement').length;
  const benign = history.filter(r => r.prediction === 'Benign').length;
  const avgRisk = total ? Math.round(history.reduce((s, r) => s + r.riskScore, 0) / total) : 0;

  const pieData = [
    { name: 'Phishing', value: phishing, color: 'hsl(0, 72%, 51%)' },
    { name: 'Defacement', value: defacement, color: 'hsl(38, 92%, 50%)' },
    { name: 'Benign', value: benign, color: 'hsl(160, 84%, 39%)' },
  ].filter(d => d.value > 0);

  const riskBuckets = [
    { range: '0-20', count: history.filter(r => r.riskScore <= 20).length },
    { range: '21-40', count: history.filter(r => r.riskScore > 20 && r.riskScore <= 40).length },
    { range: '41-60', count: history.filter(r => r.riskScore > 40 && r.riskScore <= 60).length },
    { range: '61-80', count: history.filter(r => r.riskScore > 60 && r.riskScore <= 80).length },
    { range: '81-100', count: history.filter(r => r.riskScore > 80).length },
  ];

  const stats = [
    { label: 'Total Scans', value: total, icon: Activity, cls: 'text-primary' },
    { label: 'Phishing', value: phishing, icon: ShieldAlert, cls: 'text-destructive' },
    { label: 'Defacement', value: defacement, icon: AlertTriangle, cls: 'text-[hsl(38_92%_50%)]' },
    { label: 'Benign', value: benign, icon: ShieldCheck, cls: 'text-accent' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 card-glow">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.cls}`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <span className="text-3xl font-extrabold text-foreground">{s.value}</span>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No scan data yet. Go scan some URLs!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Threat Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222, 44%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: 8, color: 'hsl(210, 40%, 92%)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Risk Score Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskBuckets}>
                <XAxis dataKey="range" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(222, 44%, 9%)', border: '1px solid hsl(222, 30%, 18%)', borderRadius: 8, color: 'hsl(210, 40%, 92%)' }} />
                <Bar dataKey="count" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <span className="text-sm text-muted-foreground">Average Risk Score: </span>
        <span className={`text-lg font-bold ${avgRisk >= 70 ? 'text-destructive' : avgRisk >= 40 ? 'text-[hsl(38_92%_50%)]' : 'text-accent'}`}>{avgRisk}</span>
      </div>
    </div>
  );
}
