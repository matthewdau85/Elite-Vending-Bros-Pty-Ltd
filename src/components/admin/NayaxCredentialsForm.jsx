import React, { useState, useEffect } from "react";
import { NayaxSetting } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Save } from "lucide-react";

export default function NayaxCredentialsForm({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    client_id: "",
    client_secret: "",
    base_url: "https://api.nayax.com"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        client_id: settings.client_id || "",
        client_secret: settings.client_secret || "",
        base_url: settings.base_url || "https://api.nayax.com"
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSaved(false);
    
    try {
      if (settings && settings.id) {
        await NayaxSetting.update(settings.id, formData);
      } else {
        await NayaxSetting.create(formData);
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      onUpdate();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="client_id">Nayax Client ID</Label>
        <Input
          id="client_id"
          type="text"
          value={formData.client_id}
          onChange={(e) => handleChange("client_id", e.target.value)}
          placeholder="Enter your Nayax Client ID"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_secret">Nayax Client Secret</Label>
        <Input
          id="client_secret"
          type="password"
          value={formData.client_secret}
          onChange={(e) => handleChange("client_secret", e.target.value)}
          placeholder="Enter your Nayax Client Secret"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="base_url">Nayax API Base URL</Label>
        <Input
          id="base_url"
          type="url"
          value={formData.base_url}
          onChange={(e) => handleChange("base_url", e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end items-center gap-4">
        {isSaved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Credentials saved successfully!</span>
          </div>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Credentials"}
        </Button>
      </div>
    </form>
  );
}