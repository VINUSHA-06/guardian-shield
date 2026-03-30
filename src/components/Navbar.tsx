import { NavLink } from 'react-router-dom';
import { Shield, BarChart3, History, Network, AlertTriangle, FlaskConical, FileText } from 'lucide-react';

const links = [
  { to: '/', label: 'Scanner', icon: Shield },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/history', label: 'History', icon: History },
  { to: '/patterns', label: 'Patterns', icon: Network },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/lab', label: 'Lab', icon: FlaskConical },
  { to: '/report', label: 'Report', icon: FileText },
];

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <div className="flex items-center gap-2 mr-6">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight text-foreground">ThreatLens<span className="text-primary">AI</span></span>
        </div>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`
            }
          >
            <l.icon className="w-4 h-4" />
            {l.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
