import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Activity, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const Processing = () => {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('id');
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState({ processed: 0, total: 0, percent: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data: dataset } = useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      const res = await fetch(`/api/datasets/${datasetId}`);
      return res.json();
    },
    enabled: !!datasetId,
    refetchInterval: (data: any) => (data?.status === 'Completed' ? false : 2000),
  });

  useEffect(() => {
    if (!datasetId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/processing/${datasetId}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'progress') {
        setProgress({
          processed: data.processed,
          total: data.total,
          percent: data.percent
        });
      } else if (data.type === 'log') {
        setLogs((prev) => [...prev, data.message]);
      }
    };

    return () => {
      ws.close();
    };
  }, [datasetId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const isCompleted = dataset?.status === 'Completed';

  if (!datasetId) {
    return <div className="p-8 text-center text-muted-foreground font-mono uppercase font-bold">No payload selected.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col font-sans">
      <div className="mb-10 border-b-4 border-border pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display uppercase mb-4 flex items-center gap-4 drop-shadow-[2px_2px_0px_hsl(var(--primary))]">
            {isCompleted ? (
              <><CheckCircle2 className="text-primary h-8 w-8" strokeWidth={3} /> SEQUENCE COMPLETE</>
            ) : (
              <><Activity className="text-primary h-8 w-8 animate-pulse" strokeWidth={3} /> SYSTEM PROCESSING</>
            )}
          </h2>
          <p className="text-muted-foreground font-mono font-bold uppercase tracking-widest">
            {isCompleted 
              ? '> Data enrichment finalized_' 
              : `> Executing analysis on payload #${datasetId}_`}
          </p>
        </div>
        {isCompleted && (
          <button 
            onClick={() => navigate(`/results?id=${datasetId}`)}
            className="bg-primary text-primary-foreground border-4 border-border px-6 py-3 font-display text-xs uppercase tracking-widest hover-zag-shadow hover-zag-dotted-grid transition-all"
          >
            VIEW RESULTS
          </button>
        )}
      </div>

      <div className="bg-card border-4 border-border p-6 mb-8 shadow-[8px_8px_0px_0px_hsl(var(--border))]">
        <div className="flex justify-between text-sm mb-4 font-mono font-bold uppercase">
          <span>&gt; Processing Engine Status</span>
          <span>{progress.processed} / {progress.total || dataset?.total_rows || 0} [ {progress.percent}% ]</span>
        </div>
        <div className="w-full h-8 bg-background border-2 border-border p-1">
          <div 
            className="h-full bg-primary transition-all duration-300 relative overflow-hidden"
            style={{ width: `${isCompleted ? 100 : progress.percent}%` }}
          >
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'
            }}></div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-black border-4 border-border p-4 flex flex-col font-mono text-sm shadow-[8px_8px_0px_0px_hsl(var(--primary))]">
        <div className="flex items-center justify-between text-zinc-500 border-b-2 border-zinc-800 pb-2 mb-4 font-bold uppercase">
          <span>CONSOLE_OUT</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-primary rounded-none animate-pulse border border-black"></span> CONNECTED</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-zinc-300">
              <span className="text-primary mr-3 font-bold">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
