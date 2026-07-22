import { LayoutDashboard, Upload, Activity, History, Settings, FileText } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Upload, label: 'Upload Data', path: '/upload' },
    { icon: Activity, label: 'Processing', path: '/processing' },
    { icon: FileText, label: 'Results', path: '/results' },
    { icon: History, label: 'History', path: '/history' },
  ];

  return (
    <div className="w-64 h-full bg-background border-r-2 border-border flex flex-col font-mono shadow-[4px_0_0_0_hsl(var(--border))] z-10 relative">
      <div className="p-6 border-b-2 border-border mb-4 bg-primary/10">
        <h1 className="text-xl font-bold font-display text-primary uppercase tracking-tighter leading-tight">
          ZAGGO
          <br/>
          NAUT
        </h1>
        <p className="text-xs text-muted-foreground mt-2 font-mono uppercase tracking-widest">Enterprise_V1</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-2 transition-all font-semibold uppercase text-sm",
                isActive 
                  ? "bg-primary text-primary-foreground border-border zag-shadow translate-x-[-2px] translate-y-[-2px]" 
                  : "bg-background border-transparent text-muted-foreground hover:border-border hover-zag-shadow hover-zag-dotted-grid hover:text-foreground"
              )}
            >
              <item.icon size={18} strokeWidth={isActive ? 3 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t-2 border-border">
        <Link 
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:border-border border-2 border-transparent transition-all uppercase text-sm font-semibold hover-zag-shadow hover-zag-dotted-grid"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </div>
  );
};
