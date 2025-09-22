
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RouteCompletionDialog({ open, onClose, onCompleted, route, machines, products }) {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [visits, setVisits] = useState([]); // Added visits state

  const handleConfirm = async () => {
    setIsLoading(true);
    // Changed onComplete to onCompleted as per the outline
    await onCompleted(route, notes);
    setIsLoading(false);
    onClose();
  };
  
  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]"> {/* Updated DialogContent className */}
        <DialogHeader>
          <DialogTitle>Complete Route: {route.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-600">
            Confirm completion for route: <span className="font-semibold">{route.name}</span>.
            This action will mark the route as completed.
          </p>
          <div>
            <Label htmlFor="route-notes">Notes for Route Completion (Optional)</Label>
            <Textarea
              id="route-notes"
              placeholder="Add any final notes or observations for the route..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Completing..." : "Confirm Completion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
