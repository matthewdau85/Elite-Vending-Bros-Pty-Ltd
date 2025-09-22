
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Mail, Smartphone, AlertTriangle, Trash2, Plus, MessageSquare } from 'lucide-react';
import { User, ReportRecipient } from "@/api/entities";
import { toast } from "sonner";

function ComplaintRecipientManager() {
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipients();
  }, []);

  const loadRecipients = async () => {
    setIsLoading(true);
    try {
      // Assuming ReportRecipient.list() can filter or we filter client-side.
      // For complaints, we might have a specific report_type or it's implicitly handled.
      // Let's assume 'complaint' as a report_type for clarity.
      const data = await ReportRecipient.list();
      setRecipients(data.filter(r => r.report_type === 'complaint') || []); // Assuming a 'complaint' type
    } catch (error) {
      toast.error("Failed to load complaint recipients.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      // Assuming ReportRecipient.create supports a report_type field
      await ReportRecipient.create({ email: newEmail, report_type: 'complaint' });
      toast.success("Complaint recipient added successfully.");
      setNewEmail("");
      loadRecipients();
    } catch (error) {
      toast.error("Failed to add complaint recipient.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await ReportRecipient.delete(id);
      toast.success("Complaint recipient removed successfully.");
      loadRecipients();
    } catch (error) {
      toast.error("Failed to remove complaint recipient.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Complaint Notification Recipients
        </CardTitle>
        <CardDescription>
          Emails listed here will receive a notification for every new complaint submitted via the public form.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input 
              type="email"
              placeholder="recipient@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {isLoading ? <p>Loading recipients...</p> : recipients.map(recipient => (
              <div key={recipient.id} className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                <span className="text-sm text-slate-700">{recipient.email}</span>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(recipient.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            {!isLoading && recipients.length === 0 && (
              <p className="text-sm text-center text-slate-500 py-4">No recipients configured.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportScheduleManager() {
  const [weeklyRecipients, setWeeklyRecipients] = useState([]);
  const [monthlyRecipients, setMonthlyRecipients] = useState([]);
  const [newWeeklyEmail, setNewWeeklyEmail] = useState("");
  const [newMonthlyEmail, setNewMonthlyEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportRecipients();
  }, []);

  const loadReportRecipients = async () => {
    setIsLoading(true);
    try {
      const data = await ReportRecipient.list(); // Assuming ReportRecipient.list() returns all types
      setWeeklyRecipients(data.filter(r => r.report_type === 'weekly_report') || []);
      setMonthlyRecipients(data.filter(r => r.report_type === 'monthly_report') || []);
    } catch (error) {
      toast.error("Failed to load report recipients.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReportRecipient = async (reportType, email, setEmailState) => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      await ReportRecipient.create({ email: email, report_type: reportType }); // Assuming create accepts report_type
      toast.success("Recipient added successfully.");
      setEmailState(""); // Clear the input field
      loadReportRecipients();
    } catch (error) {
      toast.error(`Failed to add ${reportType.replace('_', ' ')} recipient.`);
    }
  };

  const handleDeleteReportRecipient = async (id) => {
    try {
      await ReportRecipient.delete(id);
      toast.success("Recipient removed successfully.");
      loadReportRecipients();
    } catch (error) {
      toast.error(`Failed to remove recipient.`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Scheduled Business Reports
        </CardTitle>
        <CardDescription>
          Configure who receives automated weekly and monthly summary reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weekly Reports Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Weekly Summary Report Recipients</h3>
          <div className="flex gap-2 mb-4">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={newWeeklyEmail}
              onChange={(e) => setNewWeeklyEmail(e.target.value)}
            />
            <Button onClick={() => handleAddReportRecipient('weekly_report', newWeeklyEmail, setNewWeeklyEmail)}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : weeklyRecipients.length > 0 ? (
              weeklyRecipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                  <span className="text-sm text-slate-700">{recipient.email}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReportRecipient(recipient.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-slate-500 py-2">No weekly recipients configured.</p>
            )}
          </div>
        </div>

        {/* Monthly Reports Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Monthly Summary Report Recipients</h3>
          <div className="flex gap-2 mb-4">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={newMonthlyEmail}
              onChange={(e) => setNewMonthlyEmail(e.target.value)}
            />
            <Button onClick={() => handleAddReportRecipient('monthly_report', newMonthlyEmail, setNewMonthlyEmail)}>
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : monthlyRecipients.length > 0 ? (
              monthlyRecipients.map(recipient => (
                <div key={recipient.id} className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                  <span className="text-sm text-slate-700">{recipient.email}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReportRecipient(recipient.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-center text-slate-500 py-2">No monthly recipients configured.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NotificationSettings({ user }) {
  const [settings, setSettings] = useState({
    email_enabled: true,
    email_frequency: 'immediate',
    // sms_enabled is now managed within smsSettings
    push_enabled: true,
    alert_notifications: {
      critical: true,
      high: true,
      medium: false,
      low: false
    },
    report_notifications: {
      // NOTE: weekly_report and monthly_report are now managed by ReportScheduleManager.
      // Toggles for those are removed from this section to avoid confusion.
      low_stock: true,
      machine_offline: true
    },
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    notification_email: ''
  });
  const [smsSettings, setSmsSettings] = useState({
    sms_enabled: false,
    sms_phone_number: "",
    sms_alert_prefs: {
      machine_offline: true,
      low_stock: false,
      vend_failure: true,
      critical_priority: true,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (user?.notification_settings) {
      setSettings(prev => ({ ...prev, ...user.notification_settings }));
      
      // Load SMS settings, providing defaults if they don't exist
      const existingSmsSettings = user.notification_settings.sms_settings || {};
      setSmsSettings(prev => ({
        ...prev,
        ...existingSmsSettings,
        sms_alert_prefs: {
          ...prev.sms_alert_prefs,
          ...(existingSmsSettings.sms_alert_prefs || {})
        }
      }));
    }
    // Set default notification email to user's email if not already set
    if (user?.email) {
      setSettings(prev => ({ 
        ...prev, 
        notification_email: prev.notification_email || user.email 
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Merge all settings together to not overwrite anything
      const newSettings = {
        ...settings,
        sms_settings: smsSettings
      };
      await User.updateMyUserData({ notification_settings: newSettings });
      setLastSaved(new Date());
      toast.success("Notification settings saved successfully!");
    } catch (error) {
      console.error("Save notification settings error:", error);
      toast.error("Failed to save notification settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = (parent, key, value) => {
    setSettings(prev => ({ 
      ...prev, 
      [parent]: { ...prev[parent], [key]: value }
    }));
  };

  const updateSmsSetting = (key, value) => {
    setSmsSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSmsPref = (key, value) => {
    setSmsSettings(prev => ({
      ...prev,
      sms_alert_prefs: {
        ...prev.sms_alert_prefs,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <ComplaintRecipientManager />

      <ReportScheduleManager />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            SMS Alert Settings
          </CardTitle>
          <CardDescription>
            Get critical alerts sent directly to your mobile phone. Standard message rates may apply.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <div>
                  <Label className="text-base font-medium">Enable SMS Alerts</Label>
                  <p className="text-sm text-slate-500">Receive alerts via text message</p>
                </div>
              </div>
              <Switch 
                checked={smsSettings.sms_enabled} 
                onCheckedChange={(checked) => updateSmsSetting('sms_enabled', checked)}
              />
            </div>

            {smsSettings.sms_enabled && (
              <div className="ml-8 p-4 bg-slate-50 rounded-lg space-y-4">
                <div>
                  <Label htmlFor="sms_phone_number">Mobile Phone Number</Label>
                  <Input
                    id="sms_phone_number"
                    type="tel"
                    value={smsSettings.sms_phone_number}
                    onChange={(e) => updateSmsSetting('sms_phone_number', e.target.value)}
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-slate-500 mt-1">Must be a verified number in your Twilio account.</p>
                </div>
                <div>
                  <Label>Receive SMS for these alerts:</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                        <Checkbox id="sms_vend_failure" checked={smsSettings.sms_alert_prefs.vend_failure} onCheckedChange={(checked) => updateSmsPref('vend_failure', checked)} />
                        <Label htmlFor="sms_vend_failure" className="font-normal">Vend Failure</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="sms_machine_offline" checked={smsSettings.sms_alert_prefs.machine_offline} onCheckedChange={(checked) => updateSmsPref('machine_offline', checked)} />
                        <Label htmlFor="sms_machine_offline" className="font-normal">Machine Offline</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="sms_low_stock" checked={smsSettings.sms_alert_prefs.low_stock} onCheckedChange={(checked) => updateSmsPref('low_stock', checked)} />
                        <Label htmlFor="sms_low_stock" className="font-normal">Low Stock</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="sms_critical" checked={smsSettings.sms_alert_prefs.critical_priority} onCheckedChange={(checked) => updateSmsPref('critical_priority', checked)} />
                        <Label htmlFor="sms_critical" className="font-normal">Any 'Critical' Priority Alert</Label>
                    </div>
                  </div>
                </div>
                <div>
                    <Label className="mb-2 block">How alerts will be worded:</Label>
                    <div className="text-xs p-3 bg-white rounded-md border text-slate-600 space-y-1">
                        <p><strong>Vend Failure:</strong> "Vending Alert: VEND FAILURE on Machine [ID] at [Location]. A refund case has been created. Priority: [P]."</p>
                        <p><strong>Offline:</strong> "Vending Alert: Machine [ID] at [Location] is OFFLINE. Priority: [P]."</p>
                         <p><strong>Critical:</strong> "Vending Alert: CRITICAL issue '[Title]' on Machine [ID] at [Location]."</p>
                    </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>Configure how you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="notification_email">Notification Email</Label>
            <Input
              id="notification_email"
              type="email"
              value={settings.notification_email}
              onChange={(e) => updateSetting('notification_email', e.target.value)}
              placeholder="notifications@company.com"
            />
            <p className="text-xs text-slate-500 mt-1">Where to send email notifications</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-slate-500">Receive alerts and reports via email</p>
                </div>
              </div>
              <Switch 
                checked={settings.email_enabled} 
                onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
              />
            </div>

            {settings.email_enabled && (
              <div className="ml-8 p-4 bg-slate-50 rounded-lg">
                <Label htmlFor="email_frequency">Email Frequency</Label>
                <Select 
                  value={settings.email_frequency} 
                  onValueChange={(value) => updateSetting('email_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-slate-500">Browser and mobile app notifications</p>
                </div>
              </div>
              <Switch 
                checked={settings.push_enabled} 
                onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alert Preferences
          </CardTitle>
          <CardDescription>Choose which alerts trigger notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Alert Priority Levels</h4>
            {Object.entries(settings.alert_notifications).map(([priority, enabled]) => (
              <div key={priority} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={
                      priority === 'critical' ? 'bg-red-100 text-red-800' :
                      priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                  <span className="text-sm text-slate-600">Priority alerts</span>
                </div>
                <Switch 
                  checked={enabled} 
                  onCheckedChange={(checked) => updateNestedSetting('alert_notifications', priority, checked)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Automated Alert Types</h4>
            {/* The toggles for weekly/monthly reports were removed from here
                to avoid confusion with the recipient managers above. */}
            {Object.entries(settings.report_notifications).map(([report, enabled]) => (
              <div key={report} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm capitalize">
                  {report.replace(/_/g, ' ')}
                </span>
                <Switch 
                  checked={enabled} 
                  onCheckedChange={(checked) => updateNestedSetting('report_notifications', report, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>Suppress non-critical notifications during specified hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Quiet Hours</Label>
              <p className="text-sm text-slate-500">Pause non-urgent notifications</p>
            </div>
            <Switch 
              checked={settings.quiet_hours_enabled} 
              onCheckedChange={(checked) => updateSetting('quiet_hours_enabled', checked)}
            />
          </div>

          {settings.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <Label htmlFor="quiet_hours_start">Start Time</Label>
                <Input
                  id="quiet_hours_start"
                  type="time"
                  value={settings.quiet_hours_start}
                  onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quiet_hours_end">End Time</Label>
                <Input
                  id="quiet_hours_end"
                  type="time"
                  value={settings.quiet_hours_end}
                  onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end items-center gap-4">
        {lastSaved && (
          <span className="text-sm text-slate-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );
}
