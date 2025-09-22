
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@/api/entities";
import { toast } from "sonner";

export default function UserPreferences({ user }) {
  const [preferences, setPreferences] = useState({
    ui_density: 'comfortable',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    currency_format: 'AUD',
    dashboard_default: 'overview',
    theme: 'light',
    show_animations: true,
    auto_refresh: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({ ...prev, ...user.preferences }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await User.updateMyUserData({ preferences });
      setLastSaved(new Date());
      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Save preferences error:", error);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Display & Interface</CardTitle>
          <CardDescription>Customize how the application looks and feels.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">UI Density</Label>
            <p className="text-sm text-slate-500 mb-3">Choose how compact the interface should be.</p>
            <RadioGroup 
              value={preferences.ui_density} 
              onValueChange={(value) => updatePreference('ui_density', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comfortable" id="comfortable" />
                <Label htmlFor="comfortable">Comfortable - More spacing and larger elements</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="compact" />
                <Label htmlFor="compact">Compact - Tighter spacing, more data visible</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Date Format</Label>
              <Select value={preferences.date_format} onValueChange={(value) => updatePreference('date_format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (AU/UK)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Time Format</Label>
              <Select value={preferences.time_format} onValueChange={(value) => updatePreference('time_format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Currency Display</Label>
              <Select value={preferences.currency_format} onValueChange={(value) => updatePreference('currency_format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">Default Dashboard View</Label>
              <Select value={preferences.dashboard_default} onValueChange={(value) => updatePreference('dashboard_default', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Dashboard</SelectItem>
                  <SelectItem value="machines">Machines Status</SelectItem>
                  <SelectItem value="sales">Sales Analytics</SelectItem>
                  <SelectItem value="alerts">Alert Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show Animations</Label>
                <p className="text-sm text-slate-500">Enable smooth transitions and animations</p>
              </div>
              <Switch 
                checked={preferences.show_animations} 
                onCheckedChange={(checked) => updatePreference('show_animations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Auto-refresh Data</Label>
                <p className="text-sm text-slate-500">Automatically refresh dashboard data every 5 minutes</p>
              </div>
              <Switch 
                checked={preferences.auto_refresh} 
                onCheckedChange={(checked) => updatePreference('auto_refresh', checked)}
              />
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
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
