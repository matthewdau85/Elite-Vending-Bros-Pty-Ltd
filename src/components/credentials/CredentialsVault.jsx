import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Eye, EyeOff, RotateCcw, TestTube, Download,
  CheckCircle, AlertCircle, Clock, Key, ExternalLink,
  Search, Filter, Trash2
} from 'lucide-react';
import { TenantCredential, CredentialHealth, CredentialSpec } from '@/api/entities';
import { toast } from 'sonner';
import StepUpDialog from '../auth/StepUpDialog';

export default function CredentialsVault() {
  const [credentials, setCredentials] = useState([]);
  const [healthStatus, setHealthStatus] = useState({});
  const [specs, setSpecs] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showStepUp, setShowStepUp] = useState(false);
  const [revealedFields, setRevealedFields] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadVaultData();
  }, []);

  useEffect(() => {
    // Auto-mask revealed fields after 60 seconds
    const timers = {};
    revealedFields.forEach(fieldKey => {
      timers[fieldKey] = setTimeout(() => {
        setRevealedFields(prev => {
          const next = new Set(prev);
          next.delete(fieldKey);
          return next;
        });
      }, 60000);
    });

    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, [revealedFields]);

  const loadVaultData = async () => {
    try {
      setLoading(true);
      
      const [credsData, healthData, specsData] = await Promise.all([
        TenantCredential.list(),
        CredentialHealth.list(),
        CredentialSpec.list()
      ]);
      
      setCredentials(credsData);
      
      // Convert health array to lookup object
      const healthLookup = {};
      healthData.forEach(h => {
        healthLookup[h.provider_id] = h;
      });
      setHealthStatus(healthLookup);
      
      // Convert specs array to lookup object
      const specsLookup = {};
      specsData.forEach(s => {
        specsLookup[s.provider_id] = s;
      });
      setSpecs(specsLookup);
      
    } catch (error) {
      toast.error('Failed to load credentials vault');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealField = (providerId, fieldName) => {
    setShowStepUp({
      action: 'reveal',
      providerId,
      fieldName,
      reason: `View ${fieldName} for ${specs[providerId]?.provider_name || providerId}`
    });
  };

  const handleStepUpSuccess = async (stepUpToken) => {
    const { action, providerId, fieldName } = showStepUp;
    
    if (action === 'reveal') {
      const fieldKey = `${providerId}.${fieldName}`;
      setRevealedFields(prev => new Set([...prev, fieldKey]));
      
      // In a real implementation, you would:
      // 1. Call backend to decrypt and return the specific field
      // 2. Log the access in audit trail
      // 3. Handle the decrypted value securely
      
      toast.success(`${fieldName} revealed (will auto-hide in 60s)`);
    }
    
    setShowStepUp(false);
  };

  const testConnection = async (providerId) => {
    try {
      // Implementation would call the test endpoint
      toast.success('Connection test initiated');
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  const rotateCredentials = async (providerId) => {
    try {
      setShowStepUp({
        action: 'rotate',
        providerId,
        reason: `Rotate credentials for ${specs[providerId]?.provider_name || providerId}`
      });
    } catch (error) {
      toast.error('Failed to rotate credentials');
    }
  };

  const exportCredentials = async (encrypted = false) => {
    try {
      if (encrypted) {
        setShowStepUp({
          action: 'export_encrypted',
          reason: 'Export encrypted credentials backup'
        });
      } else {
        // Redacted export doesn't require step-up
        const redactedData = credentials.map(cred => ({
          provider_id: cred.provider_id,
          provider_name: specs[cred.provider_id]?.provider_name,
          status: cred.status,
          last_tested: healthStatus[cred.provider_id]?.last_check,
          health_status: healthStatus[cred.provider_id]?.status,
          public_fields: cred.public_fields,
          created_at: cred.created_date,
          // Secrets are redacted
          secrets: '[REDACTED]'
        }));
        
        const blob = new Blob([JSON.stringify(redactedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credentials-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Redacted credentials exported');
      }
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCredentials = credentials.filter(cred => {
    const spec = specs[cred.provider_id];
    const health = healthStatus[cred.provider_id];
    
    const matchesSearch = searchTerm === '' || 
      spec?.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.provider_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      health?.status === statusFilter ||
      (statusFilter === 'missing' && !health);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading credentials vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Credentials Vault
          </h1>
          <p className="text-slate-600 mt-2">Secure management of all integration credentials</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportCredentials(false)}>
            <Download className="w-4 h-4 mr-2" />
            Export (Redacted)
          </Button>
          <Button variant="outline" onClick={() => exportCredentials(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export (Encrypted)
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="missing">Missing</option>
        </select>
      </div>

      {filteredCredentials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No credentials found</h3>
            <p className="text-slate-500">No integration credentials match your current filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCredentials.map(credential => {
            const spec = specs[credential.provider_id];
            const health = healthStatus[credential.provider_id];
            
            if (!spec) return null;
            
            return (
              <Card key={credential.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Key className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {spec.provider_name}
                        {spec.documentation_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={spec.documentation_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-500 capitalize">
                        {spec.category} • Version {credential.version}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getHealthColor(health?.status)}>
                      {getHealthIcon(health?.status)}
                      {health?.status || 'unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Public Fields */}
                  {Object.keys(credential.public_fields || {}).length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-slate-700 mb-2">Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(credential.public_fields || {}).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                            <span className="text-sm font-medium">{key.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-slate-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Secret Fields */}
                  <div>
                    <h4 className="font-medium text-sm text-slate-700 mb-2">Credentials</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {spec.fields
                        .filter(field => field.field_type === 'secret')
                        .map(field => {
                          const fieldKey = `${credential.provider_id}.${field.field_name}`;
                          const isRevealed = revealedFields.has(fieldKey);
                          
                          return (
                            <div key={field.field_name} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm font-medium">
                                {field.field_name.replace(/_/g, ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600 font-mono">
                                  {isRevealed ? '••••actual-value••••' : '••••••••••••'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRevealField(credential.provider_id, field.field_name)}
                                  className="h-6 w-6 p-0"
                                >
                                  {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Health Information */}
                  {health && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Last Health Check</span>
                        <span className="text-xs text-slate-500">
                          {new Date(health.last_check).toLocaleString()}
                        </span>
                      </div>
                      
                      {health.error_messages.length > 0 && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {health.error_messages[0]}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {health.response_time_ms && (
                        <div className="text-xs text-slate-500 mt-2">
                          Response time: {health.response_time_ms}ms
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(credential.provider_id)}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="w-3 h-3" />
                      Test
                    </Button>
                    
                    {spec.rotation_supported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rotateCredentials(credential.provider_id)}
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rotate
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <StepUpDialog
        open={!!showStepUp}
        onClose={() => setShowStepUp(false)}
        onSuccess={handleStepUpSuccess}
        reason={showStepUp?.reason || 'This action requires additional authentication'}
      />
    </div>
  );
}