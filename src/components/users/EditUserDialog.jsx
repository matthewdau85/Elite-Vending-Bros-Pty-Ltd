
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Edit, Save, Info } from "lucide-react"; // Added Info import
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added Alert imports

export default function EditUserDialog({ open, onClose, onSubmit, user }) {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "user",
    preferences: {
      ui_density: "comfortable"
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFormData({
        full_name: user.full_name || "",
        role: user.role || "user",
        preferences: {
          ui_density: user.preferences?.ui_density || "comfortable"
        }
      });
    }
  }, [user, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Only submit non-protected fields (full_name and preferences)
      const updateData = {
        full_name: formData.full_name,
        preferences: formData.preferences,
      };
      await onSubmit(user.id, updateData);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (field, value) => {
    if (field.startsWith('preferences.')) {
      const prefField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit User: {user.email}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleChange("role", value)}
              disabled // Disable role editing from the UI
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              User roles must be changed from the main platform dashboard (Data &gt; Users) for security reasons.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="ui_density">UI Density Preference</Label>
            <Select 
              value={formData.preferences.ui_density} 
              onValueChange={(value) => handleChange("preferences.ui_density", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-600">
              <strong>Note:</strong> Email address cannot be changed. Role changes will affect user permissions immediately.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.full_name}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
