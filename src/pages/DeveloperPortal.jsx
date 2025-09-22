import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeyManager from '../components/devportal/ApiKeyManager';
import WebhookManager from '../components/devportal/WebhookManager';
import ApiDocs from '../components/devportal/ApiDocs';
import { KeyRound, Radio, FileCode } from 'lucide-react';

export default function DeveloperPortal() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Developer Portal</h1>
        <p className="text-slate-600 mt-2 text-lg">
          Integrate your systems with The Elite Vending Bros Pty Ltd Platform.
        </p>
      </div>

      <Tabs defaultValue="apiKeys" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="apiKeys"><KeyRound className="w-4 h-4 mr-2" /> API Keys</TabsTrigger>
          <TabsTrigger value="webhooks"><Radio className="w-4 h-4 mr-2" /> Webhooks</TabsTrigger>
          <TabsTrigger value="docs"><FileCode className="w-4 h-4 mr-2" /> API Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="apiKeys">
          <Card>
            <CardHeader>
              <CardTitle>API Key Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ApiKeyManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <WebhookManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
           <ApiDocs />
        </TabsContent>
      </Tabs>
    </div>
  );
}