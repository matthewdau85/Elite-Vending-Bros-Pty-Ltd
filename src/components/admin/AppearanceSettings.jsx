import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PanelTop, PanelBottom, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppearanceSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [density, setDensity] = useState("comfortable");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setDensity(user.preferences?.ui_density || "comfortable");
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSetDensity = async (newDensity) => {
    if (!currentUser) return;
    setIsSaving(true);
    setIsSaved(false);
    setDensity(newDensity);
    
    try {
      await User.updateMyUserData({ 
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ui_density: newDensity
        }
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      // Force a full page reload to apply styles everywhere
      window.location.reload();
    } catch (error) {
      console.error("Failed to save preference:", error);
    }
    setIsSaving(false);
  };
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-4 w-1/2 mb-6" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>UI Density</CardTitle>
        <CardDescription>
          Choose how compact the interface should be. "Compact" is useful for smaller screens or for viewing more data at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleSetDensity("comfortable")}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              density === "comfortable" ? "border-blue-600 bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            <PanelBottom className="mx-auto w-10 h-10 mb-2 text-slate-500" />
            <h3 className="font-semibold text-slate-900">Comfortable</h3>
            <p className="text-sm text-slate-500">Default spacing for a relaxed view.</p>
          </button>
          <button
            onClick={() => handleSetDensity("compact")}
            className={`p-4 border-2 rounded-lg text-center transition-all ${
              density === "compact" ? "border-blue-600 bg-blue-50" : "hover:bg-slate-50"
            }`}
          >
            <PanelTop className="mx-auto w-10 h-10 mb-2 text-slate-500" />
            <h3 className="font-semibold text-slate-900">Compact</h3>
            <p className="text-sm text-slate-500">Reduced spacing to show more data.</p>
          </button>
        </div>
        {isSaved && (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Preference saved! The page will now reload.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}