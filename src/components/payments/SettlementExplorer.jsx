import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { SettlementBatch } from '@/api/entities';
import LoadingSpinner from '../shared/LoadingSpinner';
import { toast } from 'sonner';
import { processSettlementFile } from '@/api/functions';
import { format } from 'date-fns';

export default function SettlementExplorer() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const data = await SettlementBatch.list('-settlement_date');
      setBatches(data);
    } catch (error) {
      console.error("Failed to load settlement batches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploading(true);
      try {
        const content = e.target.result;
        // In a real app, you'd select a provider. Here we hardcode a mock one.
        const mockProviderId = "mock-provider-id"; 
        const response = await processSettlementFile({ provider_id: mockProviderId, file_content: content });
        if (response.data.success) {
          toast.success(`Settlement file imported. Batch ID: ${response.data.batch_id}`);
          loadBatches();
        } else {
          toast.error(`Import failed: ${response.data.error}`);
        }
      } catch (error) {
        toast.error(`An error occurred during upload: ${error.message}`);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'reconciled': return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Reconciled</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading settlements..." />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Settlement File</CardTitle>
          <CardDescription>Upload a settlement report from your payment provider (CSV format).</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4">
                <label htmlFor="settlement-upload" className="flex-grow">
                    <Button as="span" variant="outline" className="w-full" disabled={uploading}>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Processing...' : 'Choose Settlement File'}
                    </Button>
                </label>
                <input id="settlement-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </div>
            {uploading && <LoadingSpinner text="Analyzing and importing file..." className="mt-4" />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Settlement Batches</CardTitle>
          <CardDescription>View imported settlement batches and their reconciliation status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {batches.map(batch => (
              <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Batch {batch.batch_id.slice(0, 15)}...</p>
                  <p className="text-sm text-slate-600">
                    Settled: {format(new Date(batch.settlement_date), 'PPP')} • ${(batch.total_amount_cents / 100).toFixed(2)} from {batch.total_transactions} txns
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(batch.status)}
                </div>
              </div>
            ))}
            {batches.length === 0 && <p className="text-center text-slate-500 py-8">No settlement batches imported.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}