import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

export default function DeleteUserDialog({ open, onClose, onConfirm, user }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(user.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete user:", error);
      // Optionally show an error toast to the user
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to permanently delete the user{" "}
            <strong>{user.full_name} ({user.email})</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Yes, Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}