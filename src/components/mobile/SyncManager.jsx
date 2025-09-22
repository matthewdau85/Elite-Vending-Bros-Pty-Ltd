
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, Upload, Download, Wifi, WifiOff,
  CheckCircle, AlertTriangle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import OfflineStorage from '../shared/OfflineStorage';
import { Route, Visit, ServiceTicket } from '@/api/entities';

export default function SyncManager({ 
  syncStatus, 
  setSyncStatus, 
  pendingChanges, 
  setPendingChanges 
}) {
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);

  // Helper function for uploading files, placed before performSync for clarity
  // Although as a function declaration, it would be hoisted anyway.
  const uploadPendingFiles = async () => {
    try {
      const pendingFiles = await OfflineStorage.getPendingFiles();
      
      for (const fileData of pendingFiles) {
        // In a real implementation, this would upload to your file storage
        // For now, we'll simulate it
        console.log('Would upload file:', fileData.filename);
        await OfflineStorage.removePendingFile(fileData.id);
      }
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  // performSync wrapped with useCallback to memoize it
  const performSync = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline');
      return;
    }

    setSyncStatus('syncing');
    const errors = [];
    let syncedCount = 0;

    try {
      // Get all pending updates from offline storage
      const pendingUpdates = await OfflineStorage.getPendingUpdates();

      for (const update of pendingUpdates) {
        try {
          switch (update.entityType) {
            case 'route':
              await Route.update(update.entityId, update.data);
              break;
            case 'visit':
              await Visit.update(update.entityId, update.data);
              break;
            case 'ticket':
              await ServiceTicket.update(update.entityId, update.data);
              break;
            default:
              console.warn('Unknown entity type:', update.entityType);
              continue;
          }

          // Remove successfully synced update
          await OfflineStorage.removePendingUpdate(update.id);
          syncedCount++;
        } catch (error) {
          console.error('Sync error for update:', update.id, error);
          errors.push(`${update.entityType} ${update.entityId}: ${error.message}`);
        }
      }

      // Upload any pending photos/files
      await uploadPendingFiles();

      // Update sync status
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
      setPendingChanges(prev => Math.max(0, prev - syncedCount));

      if (errors.length === 0) {
        setSyncStatus('success');
        if (syncedCount > 0) {
          toast.success(`Synced ${syncedCount} changes`);
        }
      } else {
        setSyncStatus('partial');
        setSyncErrors(errors);
        toast.warning(`Synced ${syncedCount} changes, ${errors.length} failed`);
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setSyncErrors([error.message]);
      toast.error('Sync failed: ' + error.message);
    }
  }, [setSyncStatus, setPendingChanges]); // Dependencies for useCallback

  useEffect(() => {
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }

    // Set up periodic sync when online
    if (navigator.onLine) {
      const interval = setInterval(() => {
        if (pendingChanges > 0) {
          performSync(); // Now a stable function reference due to useCallback
        }
      }, 30000); // Sync every 30 seconds if there are changes

      return () => clearInterval(interval);
    }
  }, [pendingChanges, performSync]); // Added performSync to dependencies

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSyncText = () => {
    if (!navigator.onLine) return 'Offline';
    
    switch (syncStatus) {
      case 'syncing': return 'Syncing...';
      case 'success': return 'Synced';
      case 'error': return 'Sync Failed';
      case 'partial': return 'Partial Sync';
      default: return 'Ready';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {pendingChanges > 0 && (
        <Badge variant="outline" className="text-xs">
          {pendingChanges}
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={performSync}
        disabled={!navigator.onLine || syncStatus === 'syncing'}
        className="flex items-center gap-1 px-2"
      >
        {getSyncIcon()}
        <span className="text-xs hidden sm:inline">
          {getSyncText()}
        </span>
      </Button>
    </div>
  );
}
