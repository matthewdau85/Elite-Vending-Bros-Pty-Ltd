import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  Settings,
  Download,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TenantCredential, CredentialHealth, CredentialAuditLog } from '@/api/entities';
import SecretField from '../components/credentials/SecretField';
import StepUpDialog from '../components/auth/StepUpDialog';
import { collectCredentials } from '@/api/functions';
import RequireRole from '../components/auth/RequireRole';
import { format } from 'date-fns';

// Provider specifications with security-focused metadata
const PROVIDER_SPECS = {
  nayax: {
    name: 'Nayax Telemetry',
    category: 'telemetry',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'public', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'secret', required: true },
      { name: 'base_url', label: 'API Base URL', type: 'url', required: false, default: 'https://api.nayax.com' }
    ],
    documentation: 'https://docs.nayax.com/api',
    description: 'Connect to Nayax for telemetry data and payment processing'
  },
  stripe: {
    name: 'Stripe Payments',
    category: 'payment',
    fields: [
      { name: 'secret_key', label: 'Secret Key', type: 'secret', required: true },
      { name: 'webhook_secret', label: 'Webhook Endpoint Secret', type: 'secret', required: false }
    ],
    documentation: 'https://stripe.com/docs/api',
    description: 'Process payments and manage subscriptions'
  },
  xero: {
    name: 'Xero Accounting',
    category: 'accounting',
    fields: [
      { name: 'client_id', label: 'Client ID', type: 'public', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'secret', required: true }
    ],
    documentation: 'https://developer.xero.com',
    description: 'Sync financial data with Xero accounting'
  },
  openai: {
    name: 'OpenAI',
    category: 'ai',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'secret', required: true },
      { name: 'organization', label: 'Organization ID', type: 'public', required: false }
    ],
    documentation: 'https://platform.openai.com/docs',
    description: 'AI-powered insights and automation'
  },
  twilio: {
    name: 'Twilio SMS',
    category: 'communication',
    fields: [
      { name: 'account_sid', label: 'Account SID', type: 'public', required: true },
      { name: 'auth_token', label: 'Auth Token', type: 'secret', required: true },
      { name: 'phone_number', label: 'Phone Number', type: 'public', required: true }
    ],
    documentation: 'https://www.twilio.com/docs',
    description: 'Send SMS alerts and notifications'
  }
};

export default function SecretsOnboarding() {
  const [credentials, setCredentials] = useState({});
  const [health, setHealth] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [stepUpToken, setStepUpToken] = useState(null);
  const [showStepUp, setShowStepUp] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [credsData, healthData, auditData] = await Promise.all([
        TenantCredential.list(),
        CredentialHealth.list(),
        CredentialAuditLog.list('-created_date', 100)
      ]);
      
      // Convert credentials array to object keyed by provider_id
      const credsMap = {};
      credsData.forEach(cred => {
        credsMap[cred.provider_id] = cred;
      });
      setCredentials(credsMap);
      
      // Convert health array to object keyed by provider_id
      const healthMap = {};
      healthData.forEach(h => {
        healthMap[h.provider_id] = h;
      });
      setHealth(healthMap);
      
      setAuditLogs(auditData || []);
    } catch (error) {
      toast.error('Failed to load credentials data');
    }
    setIsLoading(false);
  };

  const handleRevealSecret = (providerId, fieldName) => {
    if (!stepUpToken) {
      setPendingReveal({ providerId, fieldName });
      setShowStepUp(true);
      return;
    }
    
    const key = `${providerId}.${fieldName}`;
    setRevealedSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleStepUpSuccess = (token) => {
    setStepUpToken(token);
    if (pendingReveal) {
      const key = `${pendingReveal.providerId}.${pendingReveal.fieldName}`;
      setRevealedSecrets(prev => ({
        ...prev,
        [key]: true
      }));
      setPendingReveal(null);
    }
  };

  const handleUpdateCredentials = async (providerId, fieldName, value) => {
    setIsSaving(true);
    try {
      const currentCreds = credentials[providerId]?.public_fields || {};
      const updatedFields = { ...currentCreds, [fieldName]: value };
      
      await collectCredentials({
        provider_id: providerId,
        credentials: updatedFields,
        step_up_token: stepUpToken
      });
      
      await loadData();
      toast.success('Credentials updated successfully');
    } catch (error) {
      toast.error('Failed to update credentials: ' + error.message);
    }
    setIsSaving(false);
  };

  const categories = ['all', ...new Set(Object.values(PROVIDER_SPECS).map(p => p.category))];
  
  const filteredProviders = Object.entries(PROVIDER_SPECS).filter(([id, spec]) => {
    const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || spec.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getProviderStatus = (providerId) => {
    const cred = credentials[providerId];
    const healthStatus = health[providerId]?.status;
    
    if (!cred) return { status: 'missing', label: 'Not Configured', color: 'bg-slate-100 text-slate-600' };
    if (healthStatus === 'error') return { status: 'error', label: 'Connection Error', color: 'bg-red-100 text-red-700' };
    if (healthStatus === 'warning') return { status: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-700' };
    if (healthStatus === 'healthy') return { status: 'healthy', label: 'Connected', color: 'bg-green-100 text-green-700' };
    return { status: 'unknown', label: 'Unknown', color: 'bg-slate-100 text-slate-600' };
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireRole requiredRole="admin">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Secrets & Credentials
              </h1>
              <p className="text-slate-600 mt-1">
                Manage API keys and credentials for third-party integrations
              </p>
            </div>
            <Button onClick={loadData} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>

          <Tabs defaultValue="credentials" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Provider Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map(([providerId, spec]) => {
                  const status = getProviderStatus(providerId);
                  const cred = credentials[providerId];
                  const healthInfo = health[providerId];

                  return (
                    <Card key={providerId} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{spec.name}</CardTitle>
                            <p className="text-sm text-slate-600 mt-1">{spec.description}</p>
                          </div>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {spec.fields.map(field => {
                          const fieldValue = cred?.public_fields?.[field.name] || '';
                          const isSecret = field.type === 'secret';
                          const revealKey = `${providerId}.${field.name}`;
                          const isRevealed = revealedSecrets[revealKey];

                          return (
                            <SecretField
                              key={field.name}
                              label={field.label}
                              value={fieldValue}
                              onChange={(value) => handleUpdateCredentials(providerId, field.name, value)}
                              onReveal={isSecret ? () => handleRevealSecret(providerId, field.name) : undefined}
                              isRevealed={!isSecret || isRevealed}
                              isRequired={field.required}
                              placeholder={field.default || `Enter ${field.label.toLowerCase()}`}
                              description={field.description}
                            />
                          );
                        })}

                        {healthInfo?.error_messages?.length > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {healthInfo.error_messages[0]}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(spec.documentation, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Docs
                          </Button>
                          {healthInfo?.last_check && (
                            <span className="text-xs text-slate-500">
                              Last checked: {format(new Date(healthInfo.last_check), 'MMM d, HH:mm')}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              {/* Audit Log Header */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Security Audit Log</h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Log
                </Button>
              </div>

              {/* Audit Log Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium text-slate-600">Timestamp</th>
                          <th className="text-left p-4 font-medium text-slate-600">User</th>
                          <th className="text-left p-4 font-medium text-slate-600">Action</th>
                          <th className="text-left p-4 font-medium text-slate-600">Provider</th>
                          <th className="text-left p-4 font-medium text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="p-4 text-sm font-mono">
                              {format(new Date(log.created_date), 'MMM d, HH:mm:ss')}
                            </td>
                            <td className="p-4 text-sm">{log.performed_by}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs">
                                {log.action}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm font-medium">{log.provider_id}</td>
                            <td className="p-4">
                              {log.success ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {auditLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Key className="w-8 h-8 mx-auto mb-4 opacity-50" />
                      <p>No audit logs found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Step-up Authentication Dialog */}
      <StepUpDialog
        open={showStepUp}
        onOpenChange={setShowStepUp}
        onSuccess={handleStepUpSuccess}
        title="Reveal Secret Value"
      />
    </RequireRole>
  );
}