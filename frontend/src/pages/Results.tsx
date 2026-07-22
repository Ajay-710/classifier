import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ExternalLink, ShieldAlert, ShieldCheck, HelpCircle, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export const Results = () => {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('id') || '1';
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const limit = 50;

  const { data, isLoading } = useQuery<any>({
    queryKey: ['companies', datasetId, page, search, statusFilter],
    queryFn: async () => {
      const res = await fetch(
        `/api/companies?dataset_id=${datasetId}&page=${page}&limit=${limit}&search=${search}&status=${statusFilter}`
      );
      return res.json();
    },
    placeholderData: (prevData: any) => prevData,
  });

  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'Verified':
        return <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold font-mono uppercase bg-primary text-primary-foreground border-2 border-border"><ShieldCheck size={14} strokeWidth={3} /> VERIFIED</span>;
      case 'Unknown':
        return <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold font-mono uppercase bg-muted text-muted-foreground border-2 border-border"><HelpCircle size={14} strokeWidth={3} /> UNKNOWN</span>;
      case 'Failed':
      case 'Invalid Company':
        return <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold font-mono uppercase bg-destructive text-destructive-foreground border-2 border-border"><ShieldAlert size={14} strokeWidth={3} /> {status}</span>;
      case 'Public Email':
        return <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold font-mono uppercase bg-secondary text-secondary-foreground border-2 border-border">PUBLIC EMAIL</span>;
      default:
        return <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold font-mono uppercase bg-background text-foreground border-2 border-border">{status}</span>;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col font-sans bg-background">
      <div className="mb-8 border-b-4 border-border pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-display uppercase mb-4 text-foreground drop-shadow-[2px_2px_0px_hsl(var(--primary))]">Results_</h2>
          <p className="text-muted-foreground font-mono font-bold uppercase tracking-widest">&gt; Data ledger for payload #{datasetId}</p>
        </div>
        <button className="flex items-center gap-2 bg-foreground text-background border-4 border-border px-4 py-2 font-display text-xs uppercase hover-zag-shadow hover-zag-dotted-grid transition-all">
          <Download size={18} strokeWidth={3} /> EXPORT EXCEL
        </button>
      </div>

      <div className="bg-card border-4 border-border flex flex-col flex-1 overflow-hidden shadow-[8px_8px_0px_0px_hsl(var(--border))]">
        <div className="p-4 border-b-4 border-border flex items-center gap-4 bg-muted/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={3} />
            <input 
              type="text" 
              placeholder="SEARCH QUERY..." 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
              className="w-full h-10 pl-10 pr-4 border-2 border-border bg-background text-sm font-mono font-bold uppercase focus:outline-none focus:border-primary placeholder:text-muted-foreground transition-colors"
            />
          </div>
          
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
              className="h-10 pl-3 pr-8 border-2 border-border bg-background text-sm font-mono font-bold uppercase focus:outline-none focus:border-primary appearance-none transition-colors cursor-pointer"
            >
              <option value="">ALL STATUSES</option>
              <option value="Verified">VERIFIED</option>
              <option value="Unknown">UNKNOWN</option>
              <option value="Failed">FAILED</option>
              <option value="Public Email">PUBLIC EMAIL</option>
              <option value="Invalid Company">INVALID COMPANY</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" strokeWidth={3} />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs font-mono font-bold uppercase bg-background sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 border-b-4 border-border text-foreground">Original Name</th>
                <th className="px-6 py-4 border-b-4 border-border text-foreground">Official Domain</th>
                <th className="px-6 py-4 border-b-4 border-border text-foreground">Industry</th>
                <th className="px-6 py-4 border-b-4 border-border text-foreground">Status</th>
                <th className="px-6 py-4 border-b-4 border-border text-foreground">Confidence</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-primary font-bold uppercase tracking-widest text-lg animate-pulse">FETCHING RECORDS...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold uppercase tracking-widest">NO RECORDS MATCH QUERY</td></tr>
              ) : (
                data?.data?.map((company: any) => (
                  <tr key={company.id} className="border-b-2 border-border hover:bg-primary/10 transition-colors group">
                    <td className="px-6 py-4 font-bold uppercase group-hover:text-primary transition-colors">{company.original_name}</td>
                    <td className="px-6 py-4">
                      {company.official_domain ? (
                        <a 
                          href={`https://${company.official_domain}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 text-foreground font-bold hover:text-primary hover:underline underline-offset-4 transition-colors"
                        >
                          {company.official_domain} <ExternalLink size={14} strokeWidth={3} />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {company.industry ? (
                        <span className="bg-secondary border-2 border-border px-2 py-1 font-bold uppercase text-xs">{company.industry}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-6 py-4">
                      {company.confidence_score !== null ? (
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-3 bg-background border-2 border-border p-0.5">
                            <div 
                              className={cn(
                                "h-full",
                                company.confidence_score >= 80 ? "bg-primary" :
                                company.confidence_score >= 50 ? "bg-muted-foreground" : "bg-destructive"
                              )}
                              style={{ width: `${company.confidence_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{Math.round(company.confidence_score)}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t-4 border-border flex items-center justify-between text-sm bg-muted/50 font-mono font-bold uppercase">
          <div className="text-muted-foreground">
            RECORDS <span className="text-foreground">{((page - 1) * limit) + 1}</span> TO <span className="text-foreground">{Math.min(page * limit, data?.total || 0)}</span> OF <span className="text-foreground">{data?.total || 0}</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-background border-2 border-border text-foreground hover-zag-shadow transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              &lt; PREV
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={!data || page * limit >= data.total}
              className="px-4 py-2 bg-background border-2 border-border text-foreground hover-zag-shadow transition-all disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              NEXT &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
