import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "@/api/entities";
import { toast } from "sonner";

export default function AppearanceSettings() {
  const [density, setDensity] = useState('comfortable');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      setIsLoading(true);
      try {
        const currentUser = await User.me();
        if (currentUser?.preferences?.ui_density) {
          setDensity(currentUser.preferences.ui_density);
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserPreferences();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await User.updateMyUserData({ preferences: { ui_density: density } });
      toast.success("Appearance settings saved. The page will reload to apply changes.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      toast.error("Failed to save settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize the look and feel of the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="font-semibold">UI Density</Label>
          <p className="text-sm text-slate-500 mb-2">Choose how compact the interface should be.</p>
          {isLoading ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2"><div className="h-4 w-4 rounded-full bg-slate-200" /><div className="h-4 w-24 bg-slate-200" /></div>
              <div className="flex items-center space-x-2"><div className="h-4 w-4 rounded-full bg-slate-200" /><div className="h-4 w-24 bg-slate-200" /></div>
            </div>
          ) : (
            <RadioGroup value={density} onValueChange={setDensity}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comfortable" id="r1" />
                <Label htmlFor="r1">Comfortable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="r2" />
                <Label htmlFor="r2">Compact</Label>
              </div>
            </RadioGroup>
          )}
        </div>
        <Button onClick={handleSave} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Settings'}</Button>
      </CardContent>
    </Card>
  );
}