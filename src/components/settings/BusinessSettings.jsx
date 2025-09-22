
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User } from "@/api/entities";
import { toast } from "sonner";

export default function BusinessSettings({ user }) {
  const [settings, setSettings] = useState({
    company_name: '',
    abn: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    gst_rate: 0.1,
    default_markup: 100,
    currency: 'AUD',
    business_hours_start: '08:00',
    business_hours_end: '17:00',
    weekend_operations: false,
    commission_default_rate: 15,
    low_stock_threshold: 5,
    maintenance_reminder_days: 30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user?.business_settings) {
      setSettings(prev => ({ ...prev, ...user.business_settings }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await User.updateMyUserData({ business_settings: settings });
      setLastSaved(new Date());
      toast.success("Business settings saved successfully!");
    } catch (error) {
      console.error("Save business settings error:", error);
      toast.error("Failed to save business settings. Please try again.");
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
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic information about your business.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={settings.company_name}
                onChange={(e) => updateSetting('company_name', e.target.value)}
                placeholder="Your Company Pty Ltd"
              />
            </div>
            <div>
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                value={settings.abn}
                onChange={(e) => updateSetting('abn', e.target.value)}
                placeholder="12 345 678 901"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => updateSetting('address', e.target.value)}
              placeholder="123 Business Street, City, State, Postcode"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => updateSetting('phone', e.target.value)}
                placeholder="+61 2 1234 5678"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
                placeholder="info@company.com"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => updateSetting('website', e.target.value)}
                placeholder="www.company.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Settings</CardTitle>
          <CardDescription>Configure tax rates, pricing, and commission settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gst_rate">GST Rate (%)</Label>
              <Input
                id="gst_rate"
                type="number"
                value={settings.gst_rate * 100}
                onChange={(e) => updateSetting('gst_rate', parseFloat(e.target.value) / 100)}
                placeholder="10"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="default_markup">Default Markup (%)</Label>
              <Input
                id="default_markup"
                type="number"
                value={settings.default_markup}
                onChange={(e) => updateSetting('default_markup', parseFloat(e.target.value))}
                placeholder="100"
              />
            </div>
            <div>
              <Label htmlFor="commission_default_rate">Default Commission (%)</Label>
              <Input
                id="commission_default_rate"
                type="number"
                value={settings.commission_default_rate}
                onChange={(e) => updateSetting('commission_default_rate', parseFloat(e.target.value))}
                placeholder="15"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
          <CardDescription>Configure business hours and operational settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="business_hours_start">Business Hours Start</Label>
              <Input
                id="business_hours_start"
                type="time"
                value={settings.business_hours_start}
                onChange={(e) => updateSetting('business_hours_start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="business_hours_end">Business Hours End</Label>
              <Input
                id="business_hours_end"
                type="time"
                value={settings.business_hours_end}
                onChange={(e) => updateSetting('business_hours_end', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="low_stock_threshold">Low Stock Alert Threshold</Label>
              <Input
                id="low_stock_threshold"
                type="number"
                value={settings.low_stock_threshold}
                onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value))}
                placeholder="5"
              />
            </div>
            <div>
              <Label htmlFor="maintenance_reminder_days">Maintenance Reminder (days)</Label>
              <Input
                id="maintenance_reminder_days"
                type="number"
                value={settings.maintenance_reminder_days}
                onChange={(e) => updateSetting('maintenance_reminder_days', parseInt(e.target.value))}
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Weekend Operations</Label>
              <p className="text-sm text-slate-500">Enable weekend service routes and operations</p>
            </div>
            <Switch 
              checked={settings.weekend_operations} 
              onCheckedChange={(checked) => updateSetting('weekend_operations', checked)}
            />
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
          {isLoading ? 'Saving...' : 'Save Business Settings'}
        </Button>
      </div>
    </div>
  );
}
