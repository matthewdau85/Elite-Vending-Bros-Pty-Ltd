import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import StepUpDialog from '../auth/StepUpDialog';
import RefundRiskBadges from './RefundRiskBadges';
import { processRefundWithChecks } from '@/api/functions';

export default function RefundDecisionDialog({ 
  refundCase, 
  riskAnalysis, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStepUp, setShowStepUp] = useState(false);
  const [stepUpToken, setStepUpToken] = useState(null);

  const handleDecision = (decisionAction) => {
    setAction(decisionAction);
    
    if (riskAnalysis?.requiresStepUp && decisionAction === 'approve') {
      setShowStepUp(true);
    } else {
      processDecision(decisionAction, null);
    }
  };

  const handleStepUpSuccess = (token) => {
    setStepUpToken(token);
    setShowStepUp(false);
    processDecision(action, token);
  };

  const processDecision = async (decisionAction, authToken) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for your decision');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await processRefundWithChecks({
        refund_case_id: refundCase.id,
        action: decisionAction,
        decision_reason: reason,
        step_up_token: authToken
      });

      if (response.success) {
        toast.success(
          decisionAction === 'approve' 
            ? 'Refund approved successfully' 
            : 'Refund rejected'
        );
        onSuccess(response.refund);
        onClose();
      } else {
        if (response.requiresStepUp) {
          setShowStepUp(true);
        } else if (response.shouldBlock) {
          toast.error('Customer is blocked due to abuse pattern');
        } else {
          toast.error(response.error || 'Failed to process decision');
        }
      }
    } catch (error) {
      console.error('Decision processing error:', error);
      toast.error('Failed to process decision');
    } finally {
      setIsLoading(false);
    }
  };

  const getDecisionPrompt = () => {
    if (riskAnalysis?.shouldBlock) {
      return {
        title: 'Customer Blocked',
        description: 'This customer has been flagged for suspicious refund patterns and cannot receive additional refunds.',
        color: 'destructive'
      };
    }
    
    if (riskAnalysis?.riskLevel === 'HIGH') {
      return {
        title: 'High Risk Refund',
        description: 'This refund has been flagged as high risk. Please review carefully before approving.',
        color: 'destructive'
      };
    }
    
    if (riskAnalysis?.riskLevel === 'MEDIUM') {
      return {
        title: 'Medium Risk Refund',
        description: 'This refund shows some risk factors. Please verify the details before proceeding.',
        color: 'warning'
      };
    }
    
    return {
      title: 'Process Refund Decision',
      description: 'Please review the refund details and provide your decision.',
      color: 'default'
    };
  };

  const decisionPrompt = getDecisionPrompt();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {decisionPrompt.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Risk Analysis */}
            <RefundRiskBadges 
              riskAnalysis={riskAnalysis} 
              refundCase={refundCase} 
            />

            {/* Decision Prompt */}
            <Alert className={
              decisionPrompt.color === 'destructive' ? 'border-red-200 bg-red-50' :
              decisionPrompt.color === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {decisionPrompt.description}
              </AlertDescription>
            </Alert>

            {/* Refund Details Summary */}
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Refund Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Amount:</span> 
                  <span className="ml-2">${(refundCase.amount_cents / 100).toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Reason:</span> 
                  <span className="ml-2">{refundCase.reason_code?.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="font-medium">Customer:</span> 
                  <span className="ml-2">{refundCase.customer_contact}</span>
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> 
                  <span className="ml-2">{new Date(refundCase.created_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Decision Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Decision Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please explain your decision..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => handleDecision('reject')}
                disabled={isLoading || riskAnalysis?.shouldBlock}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject Refund
              </Button>
              
              <Button
                onClick={() => handleDecision('approve')}
                disabled={isLoading || riskAnalysis?.shouldBlock}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                {riskAnalysis?.requiresStepUp ? 'Approve (Step-up Required)' : 'Approve Refund'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <StepUpDialog
        isOpen={showStepUp}
        onClose={() => setShowStepUp(false)}
        onSuccess={handleStepUpSuccess}
        title="Manager Authorization Required"
        description="This refund requires additional authorization due to risk factors."
      />
    </>
  );
}