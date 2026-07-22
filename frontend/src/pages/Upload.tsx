import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileType } from 'lucide-react';

export const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

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

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.dataset_id) {
        navigate(`/processing?id=${data.dataset_id}`);
      }
    } catch (error) {
      alert('Error uploading file. Please check the backend connection.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Upload Dataset</h2>
        <p className="text-muted-foreground">Upload your CSV or Excel file containing company names and domains.</p>
      </div>

      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
        }`}
      >
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <UploadCloud size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">Drag & Drop your file here</h3>
        <p className="text-muted-foreground mb-6">or click to browse from your computer</p>
        
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <label 
          htmlFor="file-upload"
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition-colors"
        >
          Select File
        </label>
      </div>

      {file && (
        <div className="mt-8 bg-card border border-border p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <FileType size={24} />
            </div>
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button 
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Start Processing'}
          </button>
        </div>
      )}
    </div>
  );
};
