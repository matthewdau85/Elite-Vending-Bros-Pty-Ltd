import React from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import FeatureGate from '../components/features/FeatureGate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RefundStatsOverview from '../components/refunds/RefundStatsOverview';
// Assuming a future RefundCasesTable component
// import RefundCasesTable from '../components/refunds/RefundCasesTable';

function RefundsPageContent() {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Refund Management</h1>
            <RefundStatsOverview />
            {/* Placeholder for table */}
            <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center">
                <p className="text-slate-500">Refund Cases Table coming soon...</p>
            </div>
        </div>
    )
}

export default function RefundsPage() {
  return (
    <FeatureGate featureKey="refunds.portal" fallback={
      <div className="p-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Feature Not Enabled</AlertTitle>
          <AlertDescription>
            The refunds portal is not currently enabled for your organization. Please contact an administrator to manage feature flags.
          </AlertDescription>
        </Alert>
      </div>
    }>
      <RefundsPageContent />
    </FeatureGate>
  );
}