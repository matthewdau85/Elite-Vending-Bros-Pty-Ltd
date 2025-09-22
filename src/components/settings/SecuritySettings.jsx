
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Clock, AlertCircle } from 'lucide-react';
import { User } from "@/api/entities";
import { toast } from "sonner";

export default function SecuritySettings({ user }) {
  const [settings, setSettings] = useState({
    session_timeout: 30,
    require_2fa: false,
    password_expiry_days: 90,
    login_attempt_limit: 5,
    ip_whitelist_enabled: false,
    audit_log_retention: 365,
    force_https: true,
    api_rate_limit: 1000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user?.security_settings) {
      setSettings(prev => ({ ...prev, ...user.security_settings }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await User.updateMyUserData({ security_settings: settings });
      setLastSaved(new Date());
      toast.success("Security settings saved successfully!");
    } catch (error) {
      console.error("Save security settings error:", error);
      toast.error("Failed to save security settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Authentication & Access
          </CardTitle>
          <CardDescription>Configure login security and access controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.session_timeout}
                onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                placeholder="30"
              />
              <p className="text-xs text-slate-500 mt-1">Auto-logout after inactivity</p>
            </div>
            <div>
              <Label htmlFor="login_attempt_limit">Failed Login Limit</Label>
              <Input
                id="login_attempt_limit"
                type="number"
                value={settings.login_attempt_limit}
                onChange={(e) => updateSetting('login_attempt_limit', parseInt(e.target.value))}
                placeholder="5"
              />
              <p className="text-xs text-slate-500 mt-1">Account lockout after failed attempts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Two-Factor Authentication</Label>
                <p className="text-sm text-slate-500">Require 2FA for all admin accounts</p>
                <Badge variant="outline" className="mt-1">
                  {settings.require_2fa ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <Switch 
                checked={settings.require_2fa} 
                onCheckedChange={(checked) => updateSetting('require_2fa', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">IP Whitelist</Label>
                <p className="text-sm text-slate-500">Restrict access to specific IP addresses</p>
                <Badge variant="outline" className="mt-1">
                  {settings.ip_whitelist_enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <Switch 
                checked={settings.ip_whitelist_enabled} 
                onCheckedChange={(checked) => updateSetting('ip_whitelist_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Force HTTPS</Label>
                <p className="text-sm text-slate-500">Redirect all HTTP traffic to HTTPS</p>
                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">
                  Recommended
                </Badge>
              </div>
              <Switch 
                checked={settings.force_https} 
                onCheckedChange={(checked) => updateSetting('force_https', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Password & API Security
          </CardTitle>
          <CardDescription>Configure password policies and API access controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password_expiry_days">Password Expiry (days)</Label>
              <Input
                id="password_expiry_days"
                type="number"
                value={settings.password_expiry_days}
                onChange={(e) => updateSetting('password_expiry_days', parseInt(e.target.value))}
                placeholder="90"
              />
              <p className="text-xs text-slate-500 mt-1">Force password change after period</p>
            </div>
            <div>
              <Label htmlFor="api_rate_limit">API Rate Limit (requests/hour)</Label>
              <Input
                id="api_rate_limit"
                type="number"
                value={settings.api_rate_limit}
                onChange={(e) => updateSetting('api_rate_limit', parseInt(e.target.value))}
                placeholder="1000"
              />
              <p className="text-xs text-slate-500 mt-1">Prevent API abuse</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Audit & Compliance
          </CardTitle>
          <CardDescription>Configure audit logging and data retention policies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="audit_log_retention">Audit Log Retention (days)</Label>
            <Input
              id="audit_log_retention"
              type="number"
              value={settings.audit_log_retention}
              onChange={(e) => updateSetting('audit_log_retention', parseInt(e.target.value))}
              placeholder="365"
            />
            <p className="text-xs text-slate-500 mt-1">How long to keep audit trail records</p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Security Compliance</h4>
                <p className="text-sm text-amber-700">
                  These settings help maintain security compliance. Changes may require admin approval 
                  and could affect user experience.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end items-center gap-4">
        {lastSaved && (
          <span className="text-sm text-slate-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );
}
