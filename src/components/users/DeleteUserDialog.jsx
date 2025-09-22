import React, { useState } from "react";
import { User } from "@/api/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export default function DeleteUserDialog({ open, onClose, user, onConfirm }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await User.delete(user.id);
      toast.success(`User ${user.full_name} has been deleted.`);
      if (onConfirm) {
        onConfirm();
      }
      onClose();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
      setIsLoading(false); // Only set loading to false on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <DialogTitle>Delete User</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete the user <strong>{user?.full_name || 'this user'}</strong> ({user?.email})? This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading || !user}>
            {isLoading ? "Deleting..." : "Yes, Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}