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

  if (isLoading) return <div className="p-8">Loading history...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto h-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dataset History</h2>
          <p className="text-muted-foreground">View past processing runs and access their results.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {datasets?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
            No datasets uploaded yet.
          </div>
        ) : (
          datasets?.map((dataset: any) => (
            <div 
              key={dataset.id}
              onClick={() => navigate(dataset.status === 'Processing' ? `/processing?id=${dataset.id}` : `/results?id=${dataset.id}`)}
              className="bg-card border border-border p-6 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="p-4 bg-muted rounded-full group-hover:bg-primary/10 transition-colors">
                  {dataset.status === 'Completed' ? <CheckCircle2 className="text-green-500" /> :
                   dataset.status === 'Processing' ? <Activity className="text-blue-500 animate-pulse" /> :
                   <AlertCircle className="text-yellow-500" />}
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{dataset.filename}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(dataset.created_at).toLocaleString()}</span>
                    <span>•</span>
                    <span>{dataset.total_rows} rows</span>
                    <span>•</span>
                    <span className="font-medium">{dataset.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium mb-1">
                  {dataset.processed_rows} / {dataset.total_rows}
                </div>
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
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
