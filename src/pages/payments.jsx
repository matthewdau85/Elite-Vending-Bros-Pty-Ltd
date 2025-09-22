import React from 'react';
import { CreditCard, ShieldAlert } from 'lucide-react';
import FeatureGate from '../components/features/FeatureGate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReaderFleet from '../components/payments/ReaderFleet';
import RefundConsole from '../components/payments/RefundConsole';
import SettlementExplorer from '../components/payments/SettlementExplorer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function PaymentsPageContent() {
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Payments &amp; Settlements</h1>
            
            <Tabs defaultValue="readers">
                <TabsList>
                    <TabsTrigger value="readers">Reader Fleet</TabsTrigger>
                    <TabsTrigger value="settlements">Settlement Explorer</TabsTrigger>
                    <TabsTrigger value="refunds">Refund Console</TabsTrigger>
                </TabsList>
                <TabsContent value="readers" className="mt-6">
                    <ReaderFleet />
                </TabsContent>
                <TabsContent value="settlements" className="mt-6">
                    <SettlementExplorer />
                </TabsContent>
                <TabsContent value="refunds" className="mt-6">
                    <RefundConsole />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function PaymentsPage() {
  return (
    <FeatureGate featureKey="payments.core" fallback={
      <div className="p-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Feature Not Enabled</AlertTitle>
          <AlertDescription>
            The payments and settlements module is not currently enabled for your organization. Please contact an administrator to manage feature flags.
          </AlertDescription>
        </Alert>
      </div>
    }>
      <PaymentsPageContent />
    </FeatureGate>
  );
}