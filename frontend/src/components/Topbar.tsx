import { Search, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Topbar = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <header className="h-16 border-b-2 border-border bg-background flex items-center justify-between px-6 shrink-0 shadow-[0_4px_0_0_hsl(var(--border))] z-0 relative">
      <div className="flex-1 max-w-xl flex items-center border-2 border-border bg-card zag-shadow-sm focus-within:zag-shadow focus-within:-translate-y-[1px] focus-within:-translate-x-[1px] transition-all group">
        <div className="pl-3 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          placeholder="SEARCH COMPANIES..." 
          className="w-full h-10 bg-transparent px-3 text-sm font-mono focus:outline-none placeholder:text-muted-foreground placeholder:uppercase"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 border-2 border-border px-3 py-1.5 text-xs font-mono font-bold uppercase hover-zag-shadow hover-zag-dotted-grid transition-all bg-card">
          <span className="w-2 h-2 bg-primary rounded-none animate-pulse"></span>
          System Status: Online
        </button>
        
        <button 
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="p-2 border-2 border-border text-foreground hover-zag-shadow hover-zag-dotted-grid bg-card transition-all"
        >
          {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </header>
  );
};
