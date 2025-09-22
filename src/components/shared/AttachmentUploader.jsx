import React, { useState } from 'react';
import { UploadFile } from '@/api/integrations';
import { toast } from 'sonner';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AttachmentUploader({ onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await UploadFile({ file });
      const newFile = { url: response.file_url, name: file.name };
      const newFiles = [...uploadedFiles, newFile];
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles.map(f => f.url));
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('File upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveFile = (urlToRemove) => {
    const newFiles = uploadedFiles.filter(f => f.url !== urlToRemove);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles.map(f => f.url));
  };

  return (
    <div>
      <label htmlFor="file-upload" className="relative cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
            <span className="mt-2 text-sm font-medium text-slate-600">Uploading...</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-slate-500" />
            <span className="mt-2 text-sm font-medium text-slate-600">Click to upload or drag & drop</span>
            <span className="text-xs text-slate-500">Max file size: 5MB</span>
          </>
        )}
      </label>
      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} />

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Attachments</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between rounded-lg border bg-white p-2">
              <div className="flex items-center gap-3">
                <img src={file.url} alt={file.name} className="h-10 w-10 object-cover rounded" />
                <span className="text-sm text-slate-700 truncate">{file.name}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => handleRemoveFile(file.url)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}