import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Building2, CheckCircle2, AlertTriangle, ShieldQuestion } from 'lucide-react';

export const Dashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      return res.json();
    },
    refetchInterval: 5000,
  });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--foreground))', 'hsl(var(--muted-foreground))', '#ef4444', '#8b5cf6', '#64748b'];

  if (isLoading || !data) {
    return <div className="p-8 text-muted-foreground font-mono uppercase tracking-widest flex items-center justify-center h-full">Fetching Metrics...</div>;
  }

  const statusData = Object.entries(data.status_distribution).map(([name, value]) => ({ name, value }));
  const industryData = Object.entries(data.industry_distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10);

  return (
    <div className="p-8 h-full overflow-y-auto font-sans bg-background relative z-0">
      {/* Background Dot Grid for entire dashboard */}
      <div className="absolute inset-0 z-[-1] opacity-50" style={{
        backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="mb-10 border-b-4 border-border pb-6">
        <h2 className="text-4xl font-display uppercase mb-4 text-foreground drop-shadow-[2px_2px_0px_hsl(var(--primary))]">
          Dashboard
        </h2>
        <p className="text-muted-foreground font-mono font-bold uppercase tracking-widest">
          &gt; System Overview_
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-card border-2 border-border p-6 shadow-[6px_6px_0px_0px_hsl(var(--border))] flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-primary text-primary-foreground border-2 border-border"><Building2 size={24} strokeWidth={2.5} /></div>
          <div>
            <p className="text-xs text-muted-foreground font-bold font-mono uppercase mb-1">Total Companies</p>
            <p className="text-3xl font-display">{data.total.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-card border-2 border-border p-6 shadow-[6px_6px_0px_0px_hsl(var(--border))] flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-background border-2 border-border text-foreground"><CheckCircle2 size={24} strokeWidth={2.5} /></div>
          <div>
            <p className="text-xs text-muted-foreground font-bold font-mono uppercase mb-1">Verified</p>
            <p className="text-3xl font-display">{data.status_distribution['Verified'] || 0}</p>
          </div>
        </div>

        <div className="bg-card border-2 border-border p-6 shadow-[6px_6px_0px_0px_hsl(var(--border))] flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-muted text-muted-foreground border-2 border-border"><ShieldQuestion size={24} strokeWidth={2.5} /></div>
          <div>
            <p className="text-xs text-muted-foreground font-bold font-mono uppercase mb-1">Unknown</p>
            <p className="text-3xl font-display">{data.status_distribution['Unknown'] || 0}</p>
          </div>
        </div>

        <div className="bg-card border-2 border-border p-6 shadow-[6px_6px_0px_0px_hsl(var(--border))] flex items-start gap-4 hover:-translate-y-1 transition-transform">
          <div className="p-3 bg-destructive text-destructive-foreground border-2 border-border"><AlertTriangle size={24} strokeWidth={2.5} /></div>
          <div>
            <p className="text-xs text-muted-foreground font-bold font-mono uppercase mb-1">Failed</p>
            <p className="text-3xl font-display">
              {(data.status_distribution['Failed'] || 0) + (data.status_distribution['Invalid Company'] || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        <div className="bg-card border-2 border-border p-6 shadow-[8px_8px_0px_0px_hsl(var(--border))] h-96 flex flex-col">
          <h3 className="text-lg font-mono font-bold uppercase mb-6 zag-border-b pb-2 inline-block self-start">Status_Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={110}
                  dataKey="value"
                  stroke="hsl(var(--border))"
                  strokeWidth={2}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '2px solid hsl(var(--border))', 
                    borderRadius: '0px',
                    boxShadow: '4px 4px 0px 0px hsl(var(--border))',
                    fontFamily: '"IBM Plex Mono", monospace',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border-2 border-border p-6 shadow-[8px_8px_0px_0px_hsl(var(--border))] h-96 flex flex-col">
          <h3 className="text-lg font-mono font-bold uppercase mb-6 zag-border-b pb-2 inline-block self-start">Top_Industries</h3>
          <div className="flex-1 font-mono font-bold text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="0" horizontal={false} stroke="hsl(var(--border))" strokeWidth={2} />
                <XAxis type="number" stroke="hsl(var(--border))" strokeWidth={2} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--border))" strokeWidth={2} width={100} tick={{fill: 'hsl(var(--foreground))', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0px',
                    boxShadow: '4px 4px 0px 0px hsl(var(--border))'
                  }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" stroke="hsl(var(--border))" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
