import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, Check, X } from 'lucide-react';
import { RefundCase } from '@/api/entities';
import LoadingSpinner from '../shared/LoadingSpinner';
import { toast } from 'sonner';
import { processRefund } from '@/api/functions';

export default function RefundConsole() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const data = await RefundCase.filter({ status: { $in: ['pending', 'approved'] } }, '-created_date');
      setRefunds(data);
    } catch (error) {
      console.error("Failed to load refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const handleProcessRefund = async (refundCaseId) => {
    setProcessingId(refundCaseId);
    try {
      // In a real app, this would get a real token after user password re-entry
      const dummyStepUpToken = `user-id.${Date.now() + 300000}.dummy-sig`; 
      const response = await processRefund({ refund_case_id: refundCaseId, step_up_token: dummyStepUpToken });
      
      if (response.data.success) {
        toast.success(response.data.message);
        loadRefunds();
      } else {
        toast.error(`Refund failed: ${response.data.error}`);
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'approved': return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>;
      case 'paid': return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading refunds..." />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Refund Console</CardTitle>
            <CardDescription>Review and process pending customer refunds.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Refund
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {refunds.map(refund => (
            <div key={refund.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">${(refund.amount_cents / 100).toFixed(2)} <span className="text-slate-500 font-normal">({refund.reason_code})</span></p>
                <p className="text-sm text-slate-600">
                  Transaction: {refund.nayax_transaction_id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(refund.status)}
                {refund.status === 'pending' && (
                    <Button 
                      size="sm"
                      onClick={() => handleProcessRefund(refund.id)}
                      disabled={processingId === refund.id}
                    >
                      {processingId === refund.id ? <LoadingSpinner size="small" text="" /> : <Check className="w-4 h-4 mr-2" />}
                      Approve & Pay
                    </Button>
                )}
              </div>
            </div>
          ))}
          {refunds.length === 0 && <p className="text-center text-slate-500 py-8">No pending refunds.</p>}
        </div>
      </CardContent>
    </Card>
  );
}