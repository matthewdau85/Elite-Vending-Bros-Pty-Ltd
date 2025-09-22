import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useFeatureGate, defaultFlags } from './useFeatureGate';
import { Badge } from '@/components/ui/badge';

const featureDescriptions = {
  'payments.core': 'Enables the core Payments dashboard and Stripe integration.',
  'refunds.portal': 'Enables the customer-facing refunds portal.',
  'telemetry.alerts': 'Enables real-time alerts based on machine telemetry.',
  'mobile.field-app': 'Enables features for the mobile driver/technician app.',
  'pwa.offline': 'Enables Progressive Web App offline capabilities.',
  'accounting.xero-sync': 'Enables syncing financial data to Xero.',
  'accounting.stripe-reconcile': 'Enables Stripe settlement reconciliation tools.',
  'inventory.lottracking': 'Enables lot number and expiry date tracking for products.',
  'energy.monitoring': 'Enables the Energy & ESG monitoring dashboard.',
  'esg.reports': 'Enables generation of Environmental, Social, and Governance reports.',
  'location.intelligence': 'Enables AI-powered location insights and recommendations.',
  'api.public': 'Enables the public API and Developer Portal for third-party access.',
  'observability.core': 'Enables system health dashboards and observability tools for admins.',
};

export default function FeatureManagement() {
  const { flags, toggleFlag } = useFeatureGate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Toggle features on or off for your organization. Changes are saved locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(defaultFlags).map((key) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor={key} className="font-semibold text-base flex items-center gap-2">
                {key}
                {defaultFlags[key] ? <Badge variant="outline">Enabled by Default</Badge> : <Badge variant="secondary">Disabled by Default</Badge>}
              </Label>
              <p className="text-sm text-slate-500 mt-1">
                {featureDescriptions[key] || 'No description available.'}
              </p>
            </div>
            <Switch
              id={key}
              checked={flags[key] || false}
              onCheckedChange={() => toggleFlag(key)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}