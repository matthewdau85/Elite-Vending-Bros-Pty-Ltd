import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff, 
  TestTube, Shield, Key, Settings, ArrowRight
} from 'lucide-react';
import { credentialsCollectCredentials } from '@/api/functions';
import { toast } from 'sonner';
import StepUpDialog from '../auth/StepUpDialog';

export default function CredentialsCollector({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [requiredProviders, setRequiredProviders] = useState([]);
  const [configuredProviders, setConfiguredProviders] = useState([]);
  const [credentials, setCredentials] = useState({});
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState({});
  const [showStepUp, setShowStepUp] = useState(false);
  const [readinessStatus, setReadinessStatus] = useState({});

  useEffect(() => {
    discoverRequiredCredentials();
  }, []);

  const discoverRequiredCredentials = async () => {
    try {
      setLoading(true);
      const response = await credentialsCollectCredentials({
        action: 'discover_required'
      });
      
      if (response.data) {
        setRequiredProviders(response.data.required_providers);
        setConfiguredProviders(response.data.configured_providers);
        
        // Initialize credentials state
        const initialCreds = {};
        response.data.required_providers.forEach(provider => {
          initialCreds[provider.provider_id] = {};
          provider.fields.forEach(field => {
            initialCreds[provider.provider_id][field.field_name] = '';
          });
        });
        setCredentials(initialCreds);
      }
    } catch (error) {
      toast.error('Failed to load required credentials');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (providerId, fieldName, value) => {
    setCredentials(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldName]: value
      }
    }));
  };

  const testProvider = async (provider) => {
    try {
      setTesting(prev => ({ ...prev, [provider.provider_id]: true }));
      
      const response = await credentialsCollectCredentials({
        action: 'test_credentials',
        provider_id: provider.provider_id,
        credentials: credentials[provider.provider_id]
      });
      
      setTestResults(prev => ({
        ...prev,
        [provider.provider_id]: response.data
      }));
      
      if (response.data.success) {
        toast.success(`${provider.provider_name} connection successful`);
      } else {
        toast.error(`${provider.provider_name} test failed: ${response.data.error}`);
      }
      
    } catch (error) {
      toast.error(`Failed to test ${provider.provider_name}`);
      setTestResults(prev => ({
        ...prev,
        [provider.provider_id]: { success: false, error: error.message }
      }));
    } finally {
      setTesting(prev => ({ ...prev, [provider.provider_id]: false }));
    }
  };

  const saveCredentials = async (providerId) => {
    try {
      setShowStepUp(true);
    } catch (error) {
      toast.error('Failed to save credentials');
    }
  };

  const handleStepUpSuccess = async (stepUpToken) => {
    try {
      const providers = requiredProviders.filter(p => 
        Object.values(credentials[p.provider_id] || {}).some(v => v.trim())
      );
      
      for (const provider of providers) {
        const response = await credentialsCollectCredentials({
          action: 'save_credentials',
          provider_id: provider.provider_id,
          credentials: credentials[provider.provider_id],
          step_up_token: stepUpToken
        });
        
        if (response.data.success) {
          setReadinessStatus(prev => ({
            ...prev,
            [provider.provider_id]: 'ready'
          }));
        }
      }
      
      toast.success('Credentials saved successfully');
      setShowStepUp(false);
      
    } catch (error) {
      toast.error('Failed to save credentials');
      setShowStepUp(false);
    }
  };

  const renderProviderForm = (provider) => {
    const providerCreds = credentials[provider.provider_id] || {};
    const testResult = testResults[provider.provider_id];
    const isReady = readinessStatus[provider.provider_id] === 'ready';
    
    return (
      <Card key={provider.provider_id} className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {provider.provider_name}
                {provider.documentation_url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={provider.documentation_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </CardTitle>
              <p className="text-sm text-slate-500 capitalize">{provider.category} integration</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {testResult && (
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {testResult.success ? 'Connected' : 'Failed'}
              </Badge>
            )}
            {isReady && (
              <Badge variant="default" className="bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {provider.fields.map(field => (
            <div key={field.field_name} className="space-y-2">
              <Label className="flex items-center gap-2">
                {field.field_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {field.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                {field.field_type === 'secret' && <Key className="w-3 h-3" />}
              </Label>
              
              {field.field_type === 'enum' ? (
                <select
                  className="w-full p-2 border rounded-md"
                  value={providerCreds[field.field_name] || ''}
                  onChange={(e) => handleFieldChange(provider.provider_id, field.field_name, e.target.value)}
                >
                  <option value="">Select {field.field_name}</option>
                  {field.enum_values?.map(value => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.field_type === 'secret' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={providerCreds[field.field_name] || ''}
                  onChange={(e) => handleFieldChange(provider.provider_id, field.field_name, e.target.value)}
                />
              )}
              
              {field.help_text && (
                <p className="text-xs text-slate-500">{field.help_text}</p>
              )}
            </div>
          ))}
          
          {testResult && !testResult.success && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testResult.error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => testProvider(provider)}
              disabled={testing[provider.provider_id]}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {testing[provider.provider_id] ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReadinessChecklist = () => {
    const totalProviders = requiredProviders.length;
    const readyCount = Object.values(readinessStatus).filter(s => s === 'ready').length;
    const progress = totalProviders > 0 ? (readyCount / totalProviders) * 100 : 0;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integration Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{readyCount}/{totalProviders} integrations ready</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            {requiredProviders.map(provider => {
              const status = readinessStatus[provider.provider_id];
              const testResult = testResults[provider.provider_id];
              
              return (
                <div key={provider.provider_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'ready' ? 'bg-green-500' :
                      testResult?.success ? 'bg-yellow-500' : 'bg-gray-300'
                    }`} />
                    <span className="font-medium">{provider.provider_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'ready' && (
                      <Badge variant="default" className="bg-green-50 text-green-700">Ready</Badge>
                    )}
                    {testResult?.success && status !== 'ready' && (
                      <Badge variant="outline">Tested</Badge>
                    )}
                    {!testResult && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => saveCredentials()}
              className="flex items-center gap-2"
              disabled={readyCount === totalProviders}
            >
              <Shield className="w-4 h-4" />
              Apply Settings
            </Button>
            
            {readyCount === totalProviders && (
              <Button
                onClick={onComplete}
                className="flex items-center gap-2"
              >
                Continue Setup
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Discovering required credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API Credentials Setup</h1>
        <p className="text-slate-600">
          Configure your integrations to unlock the full power of your vending operation
        </p>
      </div>

      {requiredProviders.length === 0 ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No additional credentials required. Your current configuration is complete!
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-6">
            {requiredProviders.map(renderProviderForm)}
          </div>
          
          {renderReadinessChecklist()}
        </>
      )}

      <StepUpDialog
        open={showStepUp}
        onClose={() => setShowStepUp(false)}
        onSuccess={handleStepUpSuccess}
        reason="Secure credential storage requires additional authentication"
      />
    </div>
  );
}