import React from 'react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

function Swatch({ bg, border }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-10 rounded border" style={{ background: bg, borderColor: border }} />
    </div>
  );
}

function ThemeControls() {
  const { mode, setMode, sidebar, setSidebar } = useTheme();

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Mode */}
      <div className="space-y-2">
        <Label htmlFor="theme-mode">Theme mode</Label>
        <Select value={mode} onValueChange={setMode}>
          <SelectTrigger id="theme-mode" className="w-full">
            <SelectValue placeholder="Choose mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sidebar palette */}
      <div className="space-y-2">
        <Label>Sidebar palette</Label>
        <RadioGroup
          value={sidebar}
          onValueChange={setSidebar}
          className="grid grid-cols-2 gap-3"
        >
          <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 dark:has-[[data-state=checked]]:bg-blue-900/20">
            <RadioGroupItem value="slate" id="sb-slate" />
            <div className="flex items-center gap-3">
              <Swatch bg="#f8fafc" border="#e2e8f0" />
              <span>Slate</span>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 dark:has-[[data-state=checked]]:bg-blue-900/20">
            <RadioGroupItem value="indigo" id="sb-indigo" />
            <div className="flex items-center gap-3">
              <Swatch bg="#eef2ff" border="#c7d2fe" />
              <span>Indigo</span>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 dark:has-[[data-state=checked]]:bg-blue-900/20">
            <RadioGroupItem value="emerald" id="sb-emerald" />
            <div className="flex items-center gap-3">
              <Swatch bg="#ecfdf5" border="#a7f3d0" />
              <span>Emerald</span>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 dark:has-[[data-state=checked]]:bg-blue-900/20">
            <RadioGroupItem value="rose" id="sb-rose" />
            <div className="flex items-center gap-3">
              <Swatch bg="#fff1f2" border="#fecdd3" />
              <span>Rose</span>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50 dark:has-[[data-state=checked]]:bg-blue-900/20">
            <RadioGroupItem value="zinc" id="sb-zinc" />
            <div className="flex items-center gap-3">
              <Swatch bg="#fafafa" border="#e4e4e7" />
              <span>Zinc</span>
            </div>
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}

export default function AppearanceSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ThemeControls />
      </CardContent>
    </Card>
  );
}