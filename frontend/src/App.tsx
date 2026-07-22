import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Processing } from './pages/Processing';
import { Results } from './pages/Results';
import { History } from './pages/History';

const queryClient = new QueryClient();

// Placeholder for unbuilt pages
const Logs = () => <div className="p-6 h-full flex items-center justify-center text-muted-foreground">Logs feature coming soon</div>;
const Settings = () => <div className="p-6 h-full flex items-center justify-center text-muted-foreground">Settings coming soon</div>;

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen w-screen overflow-hidden bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/processing" element={<Processing />} />
                <Route path="/results" element={<Results />} />
                <Route path="/history" element={<History />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
