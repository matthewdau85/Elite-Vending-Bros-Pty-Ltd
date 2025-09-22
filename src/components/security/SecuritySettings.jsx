import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Lock, AlertTriangle, Clock, 
  Users, Key, Eye, Settings
} from 'lucide-react';
import { SecurityPolicy } from '@/api/entities';
import { toast } from 'sonner';
import { useFeatureGate } from '../features/useFeatureGate';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function SecuritySettings() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState(null);
  
  const stepUpEnabled = useFeatureGate('security.stepup');
  const auditEnabled = useFeatureGate('security.audit');

  useEffect(() => {
    loadSecurityPolicies();
  }, []);

  const loadSecurityPolicies = async () => {
    try {
      setLoading(true);
      const policiesData = await SecurityPolicy.list();
      setPolicies(policiesData);
    } catch (error) {
      console.error('Error loading security policies:', error);
      toast.error('Failed to load security policies');
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (policyId, updates) => {
    try {
      await SecurityPolicy.update(policyId, updates);
      await loadSecurityPolicies();
      toast.success('Security policy updated');
    } catch (error) {
      console.error('Error updating security policy:', error);
      toast.error('Failed to update security policy');
    }
  };

  const createDefaultPolicies = async () => {
    const defaultPolicies = [
      {
        policy_name: 'Refund Processing',
        policy_type: 'step_up',
        target_actions: ['PROCESS_REFUND'],
        required_role: 'ops_lead',
        requires_step_up: true,
        audit_level: 'full'
      },
      {
        policy_name: 'Bulk Device Operations',
        policy_type: 'step_up',
        target_actions: ['BULK_DEVICE_UPDATE', 'BULK_DEVICE_ASSIGN'],
        required_role: 'ops_lead',
        requires_step_up: true,
        audit_level: 'full'
      },
      {
        policy_name: 'Data Export',
        policy_type: 'step_up',
        target_actions: ['EXPORT_ALL_DATA', 'EXPORT_TELEMETRY'],
        required_role: 'accountant',
        requires_step_up: true,
        audit_level: 'detailed'
      },
      {
        policy_name: 'System Administration',
        policy_type: 'step_up',
        target_actions: ['WIPE_ALL_DATA', 'MANAGE_USERS', 'CHANGE_SETTINGS'],
        required_role: 'owner',
        requires_step_up: true,
        audit_level: 'full'
      }
    ];

    try {
      for (const policy of defaultPolicies) {
        await SecurityPolicy.create(policy);
      }
      await loadSecurityPolicies();
      toast.success('Default security policies created');
    } catch (error) {
      console.error('Error creating default policies:', error);
      toast.error('Failed to create default policies');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Security & Governance
          </h2>
          <p className="text-slate-600">Configure security policies, access controls, and audit settings</p>
        </div>
        {policies.length === 0 && (
          <Button onClick={createDefaultPolicies}>
            Create Default Policies
          </Button>
        )}
      </div>

      {/* Feature Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Step-up Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Additional authentication for sensitive operations
                </p>
                <Badge className={stepUpEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {stepUpEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Audit Logging
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Comprehensive logging of privileged actions
                </p>
                <Badge className={auditEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {auditEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Security Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No security policies configured</p>
              <Button onClick={createDefaultPolicies} className="mt-4">
                Set Up Default Policies
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <div key={policy.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-slate-900">{policy.policy_name}</h4>
                      <p className="text-sm text-slate-600">
                        Actions: {policy.target_actions.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={policy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={policy.is_active}
                        onCheckedChange={(checked) => updatePolicy(policy.id, { is_active: checked })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Required Role:</span>
                      <p className="font-medium capitalize">{policy.required_role}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Step-up Required:</span>
                      <p className="font-medium">
                        {policy.requires_step_up ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Audit Level:</span>
                      <p className="font-medium capitalize">{policy.audit_level}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Max Attempts:</span>
                      <p className="font-medium">{policy.max_failed_attempts}</p>
                    </div>
                  </div>

                  {policy.requires_step_up && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Step-up Valid:</span>
                        <p className="font-medium">{policy.step_up_valid_minutes} minutes</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Lockout Duration:</span>
                        <p className="font-medium">{policy.lockout_duration_minutes} minutes</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* RBAC Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Role-Based Access Control (RBAC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Executive Roles</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="font-medium">Owner</span>
                  <span className="text-red-700">Full Access</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="font-medium">Ops Lead</span>
                  <span className="text-orange-700">Operations</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Operational Roles</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="font-medium">Driver</span>
                  <span className="text-blue-700">Field Operations</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="font-medium">Tech</span>
                  <span className="text-purple-700">Maintenance</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Support Roles</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="font-medium">Accountant</span>
                  <span className="text-green-700">Financial</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">Viewer</span>
                  <span className="text-gray-700">Read Only</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}