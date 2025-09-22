import React, { useState, useEffect } from 'react';
import { XeroConnection } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { startXeroConnection } from '@/api/functions';
import { testXero } from '@/api/functions';
import { CredentialHealth } from '@/api/entities';
import { toast } from 'sonner';
import { format } from 'date-fns';

const HealthStatus = ({ health }) => {
  if (!health) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const config = {
    healthy: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      text: 'Healthy',
      className: 'bg-green-100 text-green-800'
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      text: 'Warning',
      className: 'bg-yellow-100 text-yellow-800'
    },
    error: {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      text: 'Error',
      className: 'bg-red-100 text-red-800'
    },
    missing: {
      icon: <XCircle className="w-4 h-4 text-slate-500" />,
      text: 'Not Configured',
      className: 'bg-slate-100 text-slate-800'
    }
  }[health.status] || { icon: null, text: health.status, className: 'bg-slate-100' };

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

export default function XeroConnectionManager() {
  const [connection, setConnection] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [connData, healthData] = await Promise.all([
        XeroConnection.list('', 1),
        CredentialHealth.filter({ provider_id: 'xero' })
      ]);
      setConnection(connData.length > 0 ? connData[0] : null);
      setHealth(healthData.length > 0 ? healthData[0] : null);
    } catch (error) {
      toast.error('Failed to load Xero connection status.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data } = await startXeroConnection();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Could not retrieve Xero auth URL.');
      }
    } catch (error) {
      toast.error('Failed to start Xero connection process.');
      console.error(error);
      setIsConnecting(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const response = await testXero();
      if (response?.data?.success) {
        toast.success(response.data.message);
      } else {
        throw new Error(response?.data?.error || 'Test failed.');
      }
      fetchData(); // Refresh health status
    } catch (error) {
      toast.error(`Xero connection test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Note: A 'disconnect' function would need to be created in the backend.
  // This would involve revoking the token with Xero and deleting the XeroConnection record.

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Xero Integration</CardTitle>
          <CardDescription>Connecting your Xero account for automated bookkeeping.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Xero Integration</CardTitle>
            <CardDescription>Connecting your Xero account for automated bookkeeping.</CardDescription>
          </div>
          {health && <HealthStatus health={health} />}
        </div>
      </CardHeader>
      <CardContent>
        {connection ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Connected to: {connection.tenant_name}</p>
                <p className="text-sm text-green-700">
                  Token expires: {format(new Date(connection.token_expiry), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleTest} disabled={isTesting}>
                {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Test Connection
              </Button>
              <Button variant="destructive" disabled>
                Disconnect
              </Button>
            </div>
             <p className="text-xs text-slate-500">The "Disconnect" feature is not yet implemented.</p>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-lg">
            <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Not Connected</h3>
            <p className="text-slate-500 mb-6">
              Connect your Xero account to automatically sync sales, expenses, and reconcile payouts.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              Connect to Xero
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}