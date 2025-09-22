
import React from 'react';
import { FileCode, ShieldAlert } from 'lucide-react';
import FeatureGate from '../components/features/FeatureGate';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeyManager from '../components/devportal/ApiKeyManager';
import WebhookManager from '../components/devportal/WebhookManager';
import ApiDocs from '../components/devportal/ApiDocs';
import RequireRole from '../components/auth/RequireRole'; // Added import for RequireRole

function DeveloperPortalContent() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Developer Portal</h1>
      <Tabs defaultValue="api_keys">
        <TabsList>
          <TabsTrigger value="api_keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="documentation">API Documentation</TabsTrigger>
        </TabsList>
        <TabsContent value="api_keys" className="mt-6">
          <ApiKeyManager />
        </TabsContent>
        <TabsContent value="webhooks" className="mt-6">
          <WebhookManager />
        </TabsContent>
        <TabsContent value="documentation" className="mt-6">
          <ApiDocs />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DeveloperPortal() { // Renamed from DeveloperPortalPage
  return (
    <RequireRole requiredRole="admin"> {/* Added RequireRole wrapper */}
      <FeatureGate featureKey="api.public" fallback={
        <div className="p-8">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Feature Not Enabled</AlertTitle>
            <AlertDescription>
              The Developer Portal & Public API is not currently enabled. Please contact an administrator.
            </AlertDescription>
          </Alert>
        </div>
      }>
        <DeveloperPortalContent />
      </FeatureGate>
    </RequireRole>
  );
}
