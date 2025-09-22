
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { Alert } from "@/api/entities";
import { toast } from "sonner";

const priorityColors = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

const statusColors = {
  open: "bg-red-100 text-red-800",
  acknowledged: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  ignored: "bg-gray-100 text-gray-800"
};

export default function AlertDetailsDialog({ open, onClose, alert, onUpdate }) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (alert) {
      setStatus(alert.status);
      setNotes(alert.resolution_notes || "");
    }
  }, [alert]);

  const handleAcknowledge = async () => {
    if (!alert) return;

    setIsLoading(true);
    try {
      await Alert.update(alert.id, {
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: "current_user@example.com"
      });
      onUpdate();
      toast.success("Alert acknowledged successfully!");
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      toast.error("Failed to acknowledge alert.");
    }
    setIsLoading(false);
  };

  const handleResolve = async () => {
    if (!alert) return;

    setIsLoading(true);
    try {
      await Alert.update(alert.id, {
        status: "resolved",
        resolved_at: new Date().toISOString(),
        resolved_by: "current_user@example.com",
        resolution_notes: notes
      });
      onUpdate();
      onClose();
      toast.success("Alert resolved successfully!");
    } catch (error) {
      console.error("Error resolving alert:", error);
      toast.error("Failed to resolve alert.");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!alert) return;

    if (window.confirm(`Are you sure you want to permanently delete this alert: "${alert.title}"? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        await Alert.update(alert.id, { status: "deleted" }); // Soft delete
        // Or use: await Alert.delete(alert.id); // Hard delete
        onUpdate();
        onClose();
        toast.success("Alert deleted successfully!");
      } catch (error) {
        console.error("Error deleting alert:", error);
        toast.error("Failed to delete alert. Please try again.");
      }
      setIsLoading(false);
    }
  };

  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{alert.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {alert.title}
                  </h3>
                  <p className="text-slate-600">
                    {alert.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={priorityColors[alert.priority]}>
                    {alert.priority}
                  </Badge>
                  <Badge className={statusColors[alert.status]}>
                    {alert.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      {alert.alert_datetime ? format(new Date(alert.alert_datetime), "PPP p") : 'No date'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">
                      {"Unknown Location"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">
                      Machine: <strong>{alert.machine_id}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">
                      Type: <strong className="capitalize">{alert.alert_type?.replace('_', ' ')}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          {(alert.acknowledged_at || alert.resolved_at) && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium text-slate-900 mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-slate-600">
                      Alert created - {alert.alert_datetime ? format(new Date(alert.alert_datetime), "PPP p") : 'No date'}
                    </span>
                  </div>

                  {alert.acknowledged_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-slate-600">
                        Acknowledged by {alert.acknowledged_by} - {format(new Date(alert.acknowledged_at), "PPP p")}
                      </span>
                    </div>
                  )}

                  {alert.resolved_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-slate-600">
                        Resolved by {alert.resolved_by} - {format(new Date(alert.resolved_at), "PPP p")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resolution Notes */}
          {alert.status !== "resolved" && (
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution Notes</Label>
              <Textarea
                id="resolution"
                placeholder="Add notes about how this alert was resolved..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {alert.resolution_notes && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium text-slate-900 mb-2">Resolution Notes</h4>
                <p className="text-slate-600 text-sm">{alert.resolution_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {alert.status === "open" && (
            <Button
              onClick={handleAcknowledge}
              disabled={isLoading}
              variant="outline"
            >
              <Clock className="w-4 h-4 mr-2" />
              {isLoading ? "Acknowledging..." : "Acknowledge"}
            </Button>
          )}

          {alert.status !== "resolved" && (
            <Button
              onClick={handleResolve}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isLoading ? "Resolving..." : "Mark Resolved"}
            </Button>
          )}

          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isLoading ? "Deleting..." : "Delete Alert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
