import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Activity, AlertCircle } from 'lucide-react';

export const History = () => {
  const navigate = useNavigate();
  
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const res = await fetch('/api/datasets');
      return res.json();
    }
  });

  if (isLoading) return <div className="p-8 font-mono uppercase tracking-widest font-bold">Fetching Archive...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto h-full font-sans bg-background">
      <div className="mb-10 border-b-4 border-border pb-6">
        <h2 className="text-4xl font-display uppercase mb-4 text-foreground drop-shadow-[2px_2px_0px_hsl(var(--primary))]">
          History_Archive
        </h2>
        <p className="text-muted-foreground font-mono font-bold uppercase tracking-widest">
          &gt; Previous Data Payloads_
        </p>
      </div>

      <div className="grid gap-6 pb-12">
        {datasets?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border-4 border-border font-mono font-bold uppercase shadow-[8px_8px_0px_0px_hsl(var(--border))]">
            NO RECORDS FOUND IN ARCHIVE.
          </div>
        ) : (
          datasets?.map((dataset: any) => (
            <div 
              key={dataset.id}
              onClick={() => navigate(dataset.status === 'Processing' ? `/processing?id=${dataset.id}` : `/results?id=${dataset.id}`)}
              className="bg-card border-4 border-border p-6 shadow-[6px_6px_0px_0px_hsl(var(--border))] flex items-center justify-between cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_hsl(var(--primary))] transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-background border-2 border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {dataset.status === 'Completed' ? <CheckCircle2 size={28} strokeWidth={2.5} /> :
                   dataset.status === 'Processing' ? <Activity size={28} strokeWidth={2.5} className="animate-pulse" /> :
                   <AlertCircle size={28} strokeWidth={2.5} className="text-destructive" />}
                </div>
                <div>
                  <h4 className="text-xl font-display uppercase mb-2 group-hover:text-primary transition-colors">{dataset.filename}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono font-bold uppercase">
                    <span className="flex items-center gap-2"><Clock size={16} strokeWidth={2.5} /> {new Date(dataset.created_at).toLocaleString()}</span>
                    <span>/</span>
                    <span>{dataset.total_rows} ROWS</span>
                    <span>/</span>
                    <span className="text-foreground bg-secondary px-2 py-0.5 border-2 border-border">{dataset.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right w-48 hidden md:block">
                <div className="text-xs font-mono font-bold uppercase mb-2">
                  {dataset.processed_rows} / {dataset.total_rows} PROCESSED
                </div>
                <div className="w-full h-3 bg-background border-2 border-border p-0.5">
                  <div 
                    className="h-full bg-primary"
                    style={{ width: `${(dataset.processed_rows / (dataset.total_rows || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
