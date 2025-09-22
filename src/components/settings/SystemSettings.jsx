import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi } from 'lucide-react';
import DataManagement from './DataManagement';
import ApiConnectionTests from './ApiConnectionTests';

export default function SystemSettings() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wifi className="w-5 h-5" /> API Connection Tests</CardTitle>
          <CardDescription>
            Verify that your third-party API integrations are configured correctly. These tests use the secret keys you have set in your app's environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <ApiConnectionTests />
        </CardContent>
      </Card>
      
      <DataManagement />
    </div>
  );
}