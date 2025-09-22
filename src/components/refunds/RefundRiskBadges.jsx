import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Ban, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function RefundRiskBadges({ riskAnalysis, refundCase }) {
  if (!riskAnalysis) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'HIGH': return <ShieldAlert className="w-3 h-3" />;
      case 'MEDIUM': return <AlertTriangle className="w-3 h-3" />;
      case 'LOW': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Risk Level Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={getRiskColor(riskAnalysis.riskLevel)} variant="outline">
          {getRiskIcon(riskAnalysis.riskLevel)}
          <span className="ml-1">Risk: {riskAnalysis.riskLevel}</span>
        </Badge>

        {riskAnalysis.requiresStepUp && (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200" variant="outline">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Step-up Required
          </Badge>
        )}

        {riskAnalysis.shouldBlock && (
          <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
            <Ban className="w-3 h-3 mr-1" />
            Customer Blocked
          </Badge>
        )}

        {refundCase?.amount_cents > 2000 && (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200" variant="outline">
            <TrendingUp className="w-3 h-3 mr-1" />
            High Value
          </Badge>
        )}
      </div>

      {/* Risk Reasons */}
      {riskAnalysis.riskReasons && riskAnalysis.riskReasons.length > 0 && (
        <Alert className={riskAnalysis.riskLevel === 'HIGH' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Risk Factors:</strong>
            <ul className="mt-1 ml-4 text-sm list-disc">
              {riskAnalysis.riskReasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Customer History */}
      {riskAnalysis.customerHistory && (
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
          <strong>Customer Pattern:</strong>
          <div className="mt-1 space-y-1">
            <div>• {riskAnalysis.customerHistory.refundCount} refunds in last 30 days</div>
            <div>• Total refunded: ${(riskAnalysis.customerHistory.totalAmount / 100).toFixed(2)}</div>
            {riskAnalysis.locationPattern?.recentCount > 0 && (
              <div>• {riskAnalysis.locationPattern.recentCount} refunds at this location (24h)</div>
            )}
          </div>
        </div>
      )}

      {/* Telemetry Evidence */}
      {riskAnalysis.telemetryEvidence?.hasEvidence && (
        <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <strong>Machine Evidence:</strong>
          <div className="mt-1 space-y-1">
            {riskAnalysis.telemetryEvidence.analysis?.hasFailedVend && (
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-500" />
                Failed vend detected
              </div>
            )}
            {riskAnalysis.telemetryEvidence.analysis?.hasJamError && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                Jam error detected
              </div>
            )}
            {riskAnalysis.telemetryEvidence.analysis?.hasSuccessfulVend && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Successful vend also detected
              </div>
            )}
            <div className="text-xs text-slate-500 mt-2">
              {riskAnalysis.telemetryEvidence.vendEvents?.length || 0} vend events, {' '}
              {riskAnalysis.telemetryEvidence.errorCodes?.length || 0} error codes
            </div>
          </div>
        </div>
      )}
    </div>
  );
}