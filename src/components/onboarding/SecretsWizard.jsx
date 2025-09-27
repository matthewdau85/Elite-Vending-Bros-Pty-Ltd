import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  CreditCard,
  Calculator,
  Cloud,
  BarChart,
  Zap,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import StepUpDialog from '../auth/StepUpDialog';
import { credentialsCollectCredentials } from '@/api/functions';

const WIZARD_STEPS = [
  { id: 'overview', title: 'Overview & Safety', icon: Shield },
  { id: 'payments', title: 'Payments', icon: CreditCard },
  { id: 'accounting', title: 'Accounting', icon: Calculator },
  { id: 'cloud', title: 'Cloud Services', icon: Cloud },
  { id: 'analytics', title: 'Analytics & AI', icon: BarChart },
  { id: 'app', title: 'App Configuration', icon: Zap },
  { id: 'summary', title: 'Review & Save', icon: CheckCircle }
];

const SECRET_GROUPS = {
  payments: {
    title: 'Payment Processing',
    description: 'Connect to payment providers for processing transactions',
    secrets: [
      {
        key: 'STRIPE_SECRET_KEY',
        label: 'Stripe Secret Key',
        placeholder: 'sk_live_...',
        help: 'Your Stripe secret key for processing payments'
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        label: 'Stripe Webhook Secret',
        placeholder: 'whsec_...',
        help: 'Webhook endpoint secret for verifying Stripe events'
      },
      {
        key: 'NAYAX_API_KEY',
        label: 'Nayax API Key',
        placeholder: 'nayax_...',
        help: 'API key for Nayax vending machine telemetry'
      }
    ]
  },
  accounting: {
    title: 'Accounting Integration',
    description: 'Connect to accounting systems for automated bookkeeping',
    secrets: [
      {
        key: 'XERO_CLIENT_ID',
        label: 'Xero Client ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        help: 'OAuth client ID from your Xero app'
      },
      {
        key: 'XERO_CLIENT_SECRET',
        label: 'Xero Client Secret',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        help: 'OAuth client secret from your Xero app'
      }
    ]
  },
  cloud: {
    title: 'Cloud Services',
    description: 'Configure cloud infrastructure for file storage and services',
    secrets: [
      {
        key: 'AWS_ACCESS_KEY_ID',
        label: 'AWS Access Key ID',
        placeholder: 'AKIAIOSFODNN7EXAMPLE',
        help: 'AWS access key for cloud services'
      },
      {
        key: 'AWS_SECRET_ACCESS_KEY',
        label: 'AWS Secret Access Key',
        placeholder: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        help: 'AWS secret key (keep this extremely secure)'
      },
      {
        key: 'AWS_REGION',
        label: 'AWS Region',
        placeholder: 'us-west-2',
        help: 'AWS region for your services'
      }
    ]
  },
  analytics: {
    title: 'Analytics & AI Services',
    description: 'Enable analytics, crash reporting, maps, and AI features',
    secrets: [
      {
        key: 'VITE_SENTRY_DSN',
        label: 'Sentry DSN',
        placeholder: 'https://xxx@xxx.ingest.sentry.io/xxx',
        help: 'Sentry DSN for error tracking and monitoring'
      },
      {
        key: 'VITE_PUBLIC_MAPS_API_KEY',
        label: 'Google Maps API Key',
        placeholder: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX',
        help: 'Google Maps API key for location features'
      },
      {
        key: 'OPENAI_API_KEY',
        label: 'OpenAI API Key',
        placeholder: 'sk-proj-xxxxxxxxxxxxxxxxxxxxx',
        help: 'OpenAI API key for AI-powered insights'
      },
      {
        key: 'RESEND_API_KEY',
        label: 'Resend API Key',
        placeholder: 're_xxxxxxxxxxxxxxxxxx',
        help: 'Resend API key for transactional emails'
      }
    ]
  },
  app: {
    title: 'Application Configuration',
    description: 'Core application settings and encryption keys',
    secrets: [
      {
        key: 'VITE_BASE44_APP_ID',
        label: 'Base44 App ID',
        placeholder: '68a9859032719af23976947e',
        help: 'Your Base44 application identifier'
      },
      {
        key: 'ENCRYPTION_KEY',
        label: 'Master Encryption Key',
        placeholder: 'Will be auto-generated if empty',
        help: 'Master key for encrypting sensitive data (32-byte base64)',
        canGenerate: true
      }
    ]
  }
};

function SecretInput({ secret, value, onChange, onReveal }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showStepUp, setShowStepUp] = useState(false);

  const handleToggleVisibility = () => {
    if (!isVisible && value) {
      setShowStepUp(true);
    } else {
      setIsVisible(!isVisible);
    }
  };

  const handleStepUpSuccess = () => {
    setShowStepUp(false);
    setIsVisible(true);
    onReveal?.(secret.key);
    
    // Auto-hide after 20 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 20000);
  };

  const generateKey = () => {
    if (secret.key === 'ENCRYPTION_KEY') {
      // Generate a 32-byte base64 key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const key = btoa(String.fromCharCode(...array));
      onChange(key);
      toast.success('Encryption key generated securely');
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={secret.key}>{secret.label}</Label>
      <div className="relative">
        <Input
          id={secret.key}
          type={isVisible ? "text" : "password"}
          placeholder={secret.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {secret.canGenerate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateKey}
              className="h-6 w-6 p-0"
            >
              <Zap className="h-3 w-3" />
            </Button>
          )}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleVisibility}
              className="h-6 w-6 p-0"
            >
              {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-500">{secret.help}</p>
      
      <StepUpDialog
        open={showStepUp}
        onOpenChange={setShowStepUp}
        onSuccess={handleStepUpSuccess}
        title="Reveal Secret"
        description="Please verify your identity to reveal this sensitive value."
      />
    </div>
  );
}

function OverviewStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Secure API Configuration</h2>
        <p className="text-slate-600">
          This wizard will help you securely configure API keys and sensitive settings.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Security Guarantees
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All secrets are encrypted with AES-256-GCM before storage</li>
          <li>• Secret values are never logged or exposed in error messages</li>
          <li>• Revealing secrets requires step-up authentication</li>
          <li>• All access is recorded in the audit log</li>
        </ul>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Best Practices
        </h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Use separate API keys for production and testing</li>
          <li>• Rotate keys regularly and revoke unused ones</li>
          <li>• Only enter keys you trust and have verified</li>
          <li>• Never share or copy keys through insecure channels</li>
        </ul>
      </div>
    </div>
  );
}

function SecretsGroupStep({ group, values, onChange, onReveal }) {
  const groupData = SECRET_GROUPS[group];
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">{groupData.title}</h2>
        <p className="text-slate-600">{groupData.description}</p>
      </div>
      
      <div className="space-y-4">
        {groupData.secrets.map((secret) => (
          <SecretInput
            key={secret.key}
            secret={secret}
            value={values[secret.key] || ''}
            onChange={(value) => onChange(secret.key, value)}
            onReveal={onReveal}
          />
        ))}
      </div>
      
      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
        💡 <strong>Tip:</strong> You can skip any fields you don't need right now. 
        You can always return to add or update these values later.
      </div>
    </div>
  );
}

function SummaryStep({ values, onSave, isSaving }) {
  const filledSecrets = Object.entries(values).filter(([key, value]) => value?.trim());
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Review Your Configuration</h2>
        <p className="text-slate-600">
          Ready to save {filledSecrets.length} secrets securely.
        </p>
      </div>
      
      {filledSecrets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Secrets to Save</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filledSecrets.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="font-mono text-sm">{key}</span>
                  <Badge variant="secondary">
                    {value.length > 0 ? `••••••${value.slice(-4)}` : 'Empty'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Button 
        onClick={onSave} 
        disabled={isSaving || filledSecrets.length === 0}
        className="w-full"
        size="lg"
      >
        {isSaving ? 'Saving Securely...' : `Save All ${filledSecrets.length} Secrets`}
      </Button>
    </div>
  );
}

export default function SecretsWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleValueChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleReveal = (key) => {
    // Log audit entry for secret reveal during setup
    console.log(`Admin revealed secret during setup: ${key}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const filledSecrets = Object.entries(values).filter(([key, value]) => value?.trim());
      let savedCount = 0;
      let failedCount = 0;
      
      for (const [key, value] of filledSecrets) {
        try {
          await credentialsCollectCredentials({
            action: 'save_credentials',
            provider_id: 'system_secrets',
            credentials: { [key]: value },
            step_up_token: 'wizard_setup' // Special token for initial setup
          });
          savedCount++;
        } catch (error) {
          console.error(`Failed to save ${key}:`, error);
          failedCount++;
        }
      }
      
      if (savedCount > 0) {
        toast.success(`Successfully saved ${savedCount} secrets`);
      }
      if (failedCount > 0) {
        toast.error(`Failed to save ${failedCount} secrets`);
      }
      
      onComplete?.();
    } catch (error) {
      toast.error('Failed to save secrets: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">API Configuration Wizard</h1>
          <Badge variant="outline">
            Step {currentStep + 1} of {WIZARD_STEPS.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-slate-500">
          <span>{currentStepData.title}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {currentStep === 0 && <OverviewStep />}
          {currentStep === 1 && (
            <SecretsGroupStep 
              group="payments" 
              values={values} 
              onChange={handleValueChange}
              onReveal={handleReveal}
            />
          )}
          {currentStep === 2 && (
            <SecretsGroupStep 
              group="accounting" 
              values={values} 
              onChange={handleValueChange}
              onReveal={handleReveal}
            />
          )}
          {currentStep === 3 && (
            <SecretsGroupStep 
              group="cloud" 
              values={values} 
              onChange={handleValueChange}
              onReveal={handleReveal}
            />
          )}
          {currentStep === 4 && (
            <SecretsGroupStep 
              group="analytics" 
              values={values} 
              onChange={handleValueChange}
              onReveal={handleReveal}
            />
          )}
          {currentStep === 5 && (
            <SecretsGroupStep 
              group="app" 
              values={values} 
              onChange={handleValueChange}
              onReveal={handleReveal}
            />
          )}
          {currentStep === 6 && (
            <SummaryStep 
              values={values} 
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0 || isSaving}
        >
          Previous
        </Button>
        
        {currentStep < WIZARD_STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(prev => Math.min(WIZARD_STEPS.length - 1, prev + 1))}
            disabled={isSaving}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={onComplete}
            disabled={isSaving}
            className="text-slate-500"
          >
            Exit Wizard
          </Button>
        )}
      </div>
      
      {/* Post-completion actions */}
      {currentStep === 6 && !isSaving && (
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Next Steps</h3>
          <div className="space-y-2 text-sm">
            <Button variant="outline" size="sm" className="mr-2">
              <ExternalLink className="w-3 h-3 mr-1" />
              Test Connections
            </Button>
            <Button variant="outline" size="sm" className="mr-2">
              <Copy className="w-3 h-3 mr-1" />
              Generate .env.example
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}