
import React from 'react';
import { Settings as SettingsIcon, Bell, Palette, Building, Server, Shield, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserPreferences from '../components/settings/UserPreferences';
import SecuritySettings from '../components/settings/SecuritySettings';
import BusinessSettings from '../components/settings/BusinessSettings';
import SystemSettings from '../components/settings/SystemSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import DataManagement from '../components/settings/DataManagement';
import ApiConnectionTests from '../components/settings/ApiConnectionTests';

const TABS_CONFIG = [
  { value: 'business', label: 'Business', icon: Building, component: <BusinessSettings /> },
  { value: 'connections', label: 'Connections', icon: Server, component: <ApiConnectionTests /> },
  { value: 'security', label: 'Security', icon: Shield, component: <SecuritySettings /> },
  { value: 'data', label: 'Data', icon: Database, component: <DataManagement /> },
  { value: 'notifications', label: 'Notifications', icon: Bell, component: <NotificationSettings /> },
  { value: 'appearance', label: 'Appearance', icon: Palette, component: <UserPreferences /> },
  { value: 'system', label: 'System', icon: SettingsIcon, component: <SystemSettings /> },
];

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your business, integration, and user settings.</p>
        </header>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-6">
            {TABS_CONFIG.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS_CONFIG.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
