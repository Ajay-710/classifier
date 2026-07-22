import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ExternalLink, ShieldAlert, ShieldCheck, HelpCircle, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export const Results = () => {
  const [searchParams] = useSearchParams();
  const datasetId = searchParams.get('id') || '1'; // Default to 1 for demo if not provided
  
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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500"><ShieldCheck size={14}/> Verified</span>;
      case 'Unknown':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500"><HelpCircle size={14}/> Unknown</span>;
      case 'Failed':
      case 'Invalid Company':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500"><ShieldAlert size={14}/> {status}</span>;
      case 'Public Email':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-500">Public Email</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-500">{status}</span>;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1">Results</h2>
          <p className="text-muted-foreground">Review and export classified companies.</p>
        </div>
        <button className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg font-medium transition-colors">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl flex flex-col flex-1 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or domain..." 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
              className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Unknown">Unknown</option>
              <option value="Failed">Failed</option>
              <option value="Public Email">Public Email</option>
              <option value="Invalid Company">Invalid Company</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Original Name</th>
                <th className="px-6 py-3 font-medium">Official Domain</th>
                <th className="px-6 py-3 font-medium">Industry</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No results found.</td></tr>
              ) : (
                data?.data?.map((company: any) => (
                  <tr key={company.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{company.original_name}</td>
                    <td className="px-6 py-4">
                      {company.official_domain ? (
                        <a 
                          href={`https://${company.official_domain}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {company.official_domain} <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {company.industry ? (
                        <span className="bg-secondary px-2 py-1 rounded-md text-secondary-foreground">{company.industry}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-6 py-4">
                      {company.confidence_score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                company.confidence_score >= 80 ? "bg-green-500" :
                                company.confidence_score >= 50 ? "bg-yellow-500" : "bg-red-500"
                              )}
                              style={{ width: `${company.confidence_score}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(company.confidence_score)}%</span>
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
        
        <div className="p-4 border-t border-border flex items-center justify-between text-sm bg-muted/30">
          <div className="text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((page - 1) * limit) + 1}</span> to <span className="font-medium text-foreground">{Math.min(page * limit, data?.total || 0)}</span> of <span className="font-medium text-foreground">{data?.total || 0}</span> results
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={!data || page * limit >= data.total}
              className="px-3 py-1 border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
