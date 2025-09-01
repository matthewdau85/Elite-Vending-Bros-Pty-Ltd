import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap } from "lucide-react";
import { format } from "date-fns";
import { syncNayaxData } from "@/api/functions"; // Import the real function

export default function SyncController({ settings, onUpdate }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState([]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncLog([]);

    const log = (message) => {
      setSyncLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    };

    log("Starting Nayax data synchronization...");

    try {
      const { data } = await syncNayaxData();
      if (data && data.logs) {
        data.logs.forEach(log);
      }
      if (!data.success) {
        log(`Error from backend: ${data.error}`);
      }
      onUpdate(); // Refresh parent data
    } catch (error) {
      log(`Error during sync: ${error.message}`);
    }

    setIsSyncing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
        <div>
          <h4 className="font-semibold">Manual Synchronization</h4>
          <p className="text-sm text-slate-600">
            Last Sync: {settings?.last_sync_date
              ? format(new Date(settings.last_sync_date), "MMM d, yyyy h:mm a")
              : "Never"}
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={!settings || isSyncing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Sync Log</h4>
        <ScrollArea className="h-48 w-full rounded-md border bg-slate-900 text-slate-200 font-mono text-xs">
          <div className="p-4">
            {syncLog.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
            {isSyncing && (
              <p className="animate-pulse">Waiting for next step...</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}