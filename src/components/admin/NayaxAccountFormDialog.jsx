import React, { useState, useEffect } from "react";
import { NayaxSetting } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function NayaxAccountFormDialog({ open, setting, onClose, onSave }) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!setting;

  useEffect(() => {
    if (setting) {
      setName(setting.name || "");
      setClientId(setting.client_id || "");
      setClientSecret(setting.client_secret || "");
      setStatus(setting.status || "active");
    } else {
      // Reset form for new entry
      setName("");
      setClientId("");
      setClientSecret("");
      setStatus("active");
    }
  }, [setting]);

  const handleSubmit = async () => {
    if (!name || !clientId || !clientSecret) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsLoading(true);
    try {
      const data = { name, client_id: clientId, client_secret: clientSecret, status };
      if (isEditMode) {
        await NayaxSetting.update(setting.id, data);
        toast.success(`Account "${name}" updated successfully.`);
      } else {
        await NayaxSetting.create(data);
        toast.success(`Account "${name}" added successfully.`);
      }
      onSave(); // This refreshes the list
      onClose(); // This closes the dialog
    } catch (error) {
      console.error("Failed to save Nayax setting:", error);
      toast.error("Failed to save account settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Nayax Account" : "Add Nayax Account"}</DialogTitle>
          <DialogDescription>
            Enter the credentials for your Nayax account. These are stored securely.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sydney CBD Account"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_id">Client ID</Label>
            <Input
              id="client_id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_secret">Client Secret</Label>
            <Input
              id="client_secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={isLoading}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}