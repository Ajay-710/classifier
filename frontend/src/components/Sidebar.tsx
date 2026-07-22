
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Activity, 
  TableProperties, 
  History, 
  Terminal, 
  Settings 
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Upload Dataset', path: '/upload', icon: Upload },
  { name: 'Processing', path: '/processing', icon: Activity },
  { name: 'Results', path: '/results', icon: TableProperties },
  { name: 'History', path: '/history', icon: History },
  { name: 'Logs', path: '/logs', icon: Terminal },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-border bg-card h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Estride Classifier
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
