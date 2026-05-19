'use client';

import { useState } from 'react';
import { Upload, FileUp, Loader2 } from 'lucide-react';

export default function UploadExcel({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMsg(`Successfully imported ${data.count} records.`);
      onUploadSuccess();
      
      // Clear input
      e.target.value = '';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
        <Upload className="w-8 h-8 text-blue-500" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800">Upload Financial Data</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Import your Excel file containing company financial results.
        </p>
      </div>
      
      <div className="relative">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center space-x-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
          <span>{loading ? 'Uploading...' : 'Select Excel File'}</span>
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
      {successMsg && <p className="text-green-500 text-sm mt-2 font-medium">{successMsg}</p>}
    </div>
  );
}
