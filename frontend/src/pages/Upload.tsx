import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected && (selected.name.endsWith('.csv') || selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls'))) {
      setFile(selected);
      setError('');
    } else {
      setError('Please upload a valid Excel or CSV file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      // Navigate to processing view
      navigate(`/processing?id=${data.dataset_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 h-full bg-background relative z-0 flex flex-col items-center justify-center font-sans">
      <div className="absolute inset-0 z-[-1] opacity-50" style={{
        backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="w-full max-w-2xl bg-card border-4 border-border p-8 shadow-[8px_8px_0px_0px_hsl(var(--border))]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display uppercase mb-4 text-foreground">Upload Dataset</h2>
          <p className="text-muted-foreground font-mono uppercase tracking-widest font-bold text-sm">
            &gt; Awaiting CSV or Excel payload_
          </p>
        </div>

        {!file ? (
          <div 
            {...getRootProps()} 
            className={`border-4 border-dashed transition-all cursor-pointer p-12 text-center group bg-background
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary hover-zag-shadow hover-zag-dotted-grid'}
            `}
          >
            <input {...getInputProps()} />
            <div className="bg-muted w-20 h-20 mx-auto rounded-none flex items-center justify-center mb-4 border-2 border-border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <UploadIcon size={32} strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold font-mono uppercase mb-2">
              {isDragActive ? 'Drop Payload Here' : 'Drag & Drop Payload Here'}
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              OR CLICK TO BROWSE
            </p>
          </div>
        ) : (
          <div className="border-4 border-border p-6 bg-background">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/20 text-primary border-2 border-border">
                  <FileSpreadsheet size={32} />
                </div>
                <div>
                  <p className="font-bold font-mono text-lg">{file.name}</p>
                  <p className="text-sm text-muted-foreground font-mono uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-destructive transition-all"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-primary text-primary-foreground border-4 border-border py-4 font-display text-sm uppercase tracking-widest hover-zag-shadow hover-zag-dotted-grid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'INITIALIZING ENGINE...' : 'COMMENCE PROCESSING'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-destructive/10 border-2 border-destructive text-destructive flex items-center gap-3 font-mono font-bold uppercase">
            <AlertCircle size={20} strokeWidth={3} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
