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

  // Fetch dataset status to check if completed
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

    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}///ws/processing/${datasetId}`);

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
    return <div className="p-8 text-center text-muted-foreground">No dataset selected.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            {isCompleted ? (
              <><CheckCircle2 className="text-green-500 h-8 w-8" /> Processing Complete</>
            ) : (
              <><Activity className="text-blue-500 h-8 w-8 animate-pulse" /> Processing Dataset #{datasetId}</>
            )}
          </h2>
          <p className="text-muted-foreground">
            {isCompleted 
              ? 'All companies have been verified and classified.' 
              : 'Our AI engines are searching, scraping, and analyzing your dataset in real-time.'}
          </p>
        </div>
        {isCompleted && (
          <button 
            onClick={() => navigate(`/results?id=${datasetId}`)}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          >
            View Results
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex justify-between text-sm mb-2 font-medium">
          <span>Overall Progress</span>
          <span>{progress.processed} / {progress.total || dataset?.total_rows || 0} ({progress.percent}%)</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${isCompleted ? 100 : progress.percent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 bg-black rounded-xl p-4 overflow-hidden flex flex-col font-mono text-sm border border-border shadow-inner">
        <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-800 pb-2 mb-4">
          <span>Live Console Output</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Connected</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-zinc-300">
              <span className="text-zinc-600 mr-3">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
