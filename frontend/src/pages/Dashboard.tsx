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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  if (isLoading || !data) {
    return <div className="p-8 text-muted-foreground flex items-center justify-center h-full">Loading dashboard stats...</div>;
  }

  // Format data for Recharts
  const statusData = Object.entries(data.status_distribution).map(([name, value]) => ({ name, value }));
  const industryData = Object.entries(data.industry_distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10); // Top 10 industries

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your enterprise dataset processing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Building2 size={24} /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Companies</p>
            <p className="text-2xl font-bold">{data.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Verified</p>
            <p className="text-2xl font-bold">{data.status_distribution['Verified'] || 0}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg"><ShieldQuestion size={24} /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Unknown</p>
            <p className="text-2xl font-bold">{data.status_distribution['Unknown'] || 0}</p>
          </div>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Failed / Invalid</p>
            <p className="text-2xl font-bold">
              {(data.status_distribution['Failed'] || 0) + (data.status_distribution['Invalid Company'] || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Top 10 Industries</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
