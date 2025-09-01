import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  Save, 
  Clock, 
  Settings,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";

export default function DatabaseBackup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const [backupStatus, setBackupStatus] = useState("idle"); // idle, in_progress, success, error
  const [schedule, setSchedule] = useState("daily");

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setBackupStatus("in_progress");
    // This is a simulation. A real implementation would trigger a backend function.
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        setBackupStatus("success");
        setLastBackupDate(new Date());
      } else {
        setBackupStatus("error");
      }
      setIsBackingUp(false);
    }, 5000); // Simulate 5 second backup
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Backend Functions Required:</strong> Database backup requires backend functions to be enabled and configured with your AWS credentials and backup database (e.g., Amazon RDS) details. This panel controls the process.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* On-Demand Backup */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>On-Demand Backup</CardTitle>
            <CardDescription>Manually trigger a full backup to your AWS database at any time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isBackingUp ? "Backing Up..." : "Back Up Entire Database Now"}
            </Button>
            
            {backupStatus === 'in_progress' && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 animate-pulse">
                <Clock className="w-4 h-4" />
                Backup in progress. This may take several minutes...
              </div>
            )}

            {backupStatus === 'success' && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Backup completed successfully!
              </div>
            )}
            
            {backupStatus === 'error' && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                Backup failed. Please check logs and try again.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Backups */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Scheduled Backups</CardTitle>
            <CardDescription>Configure automatic, regular backups of your data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Backup Frequency</label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg border">
              <p><strong>Last Backup:</strong> {lastBackupDate ? format(lastBackupDate, "MMM d, yyyy h:mm a") : "Never"}</p>
              <p><strong>Next Scheduled:</strong> {schedule !== 'disabled' ? `Tomorrow at 2:00 AM` : "Disabled"}</p>
              <p><strong>Status:</strong> <span className="font-medium text-green-600">Active</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}