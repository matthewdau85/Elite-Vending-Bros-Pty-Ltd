import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw, Server, Wifi, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialHealth } from '@/api/entities';
import { testNayax, testXero, testGoogleMapsApi, testTwilio } from '@/api/functions/all';
import { formatDistanceToNow } from 'date-fns';

const PROVIDERS = [
  { id: 'nayax', name: 'Nayax Telemetry', description: 'Primary vending machine data provider.', testFn: testNayax },
  { id: 'xero', name: 'Xero Accounting', description: 'Financial data synchronization.', testFn: testXero },
  { id: 'google_maps', name: 'Google Maps', description: 'Geocoding and route optimization.', testFn: testGoogleMapsApi },
  { id: 'twilio', name: 'Twilio Messaging', description: 'SMS alerts and notifications.', testFn: testTwilio },
];

const statusConfig = {
  healthy: { icon: CheckCircle, color: 'text-green-600', badge: 'bg-green-100 text-green-800' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-800' },
  error: { icon: AlertTriangle, color: 'text-red-600', badge: 'bg-red-100 text-red-800' },
  missing: { icon: HelpCircle, color: 'text-slate-500', badge: 'bg-slate-100 text-slate-800' },
};

export default function ApiConnectionTests() {
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState({});

  const loadHealthData = async () => {
    try {
      const healthRecords = await CredentialHealth.list();
      const healthMap = healthRecords.reduce((acc, record) => {
        acc[record.provider_id] = record;
        return acc;
      }, {});
      setHealthData(healthMap);
    } catch (error) {
      toast.error('Failed to load connection health status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const handleTest = async (provider) => {
    setTesting(prev => ({ ...prev, [provider.id]: true }));
    try {
      const response = await provider.testFn();
      if (response.data?.success) {
        toast.success(`${provider.name} connection is healthy.`);
      } else {
        throw new Error(response.data?.error || 'Test failed with no specific error message.');
      }
    } catch (error) {
      toast.error(`Failed to test ${provider.name}: ${error.message}`);
    } finally {
      await loadHealthData();
      setTesting(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const handleTestAll = async () => {
    const allProviderIds = PROVIDERS.reduce((acc, p) => ({ ...acc, [p.id]: true }), {});
    setTesting(allProviderIds);
    
    await Promise.all(PROVIDERS.map(p => p.testFn().catch(e => console.error(e))));
    
    toast.info('All connection tests completed.');
    await loadHealthData();
    setTesting({});
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Connection Status
            </CardTitle>
            <CardDescription>
              Monitor and test the status of all external service integrations.
            </CardDescription>
          </div>
          <Button onClick={handleTestAll} disabled={Object.values(testing).some(Boolean)}>
            {Object.values(testing).some(Boolean) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Test All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {PROVIDERS.map(provider => {
            const health = healthData[provider.id];
            const status = health?.status || 'missing';
            const StatusIcon = statusConfig[status].icon;

            return (
              <div key={provider.id} className="border p-4 rounded-lg bg-slate-50">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${statusConfig[status].color}`} />
                      {provider.name}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">{provider.description}</p>
                    {health?.last_check && (
                      <p className="text-xs text-slate-500 mt-2">
                        Last checked: {formatDistanceToNow(new Date(health.last_check), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusConfig[status].badge}>{status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(provider)}
                      disabled={testing[provider.id]}
                    >
                      {testing[provider.id] ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                </div>
                {status === 'error' && health?.error_messages?.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Last Error</AlertTitle>
                    <AlertDescription className="font-mono text-xs">
                      {health.error_messages[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}