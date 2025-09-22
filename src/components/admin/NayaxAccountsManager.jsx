import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { NayaxSetting } from '@/api/entities';
import { syncNayaxData } from '@/api/functions';
import { safeArray, safeString } from '@/components/shared/SearchUtils';
import { formatDistanceToNow } from 'date-fns';

import NayaxAccountFormDialog from './NayaxAccountFormDialog';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';

export default function NayaxAccountsManager() {
  const [settings, setSettings] = useState([]);
  
  const [editingSetting, setEditingSetting] = useState(null);

  const [deletingSetting, setDeletingSetting] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [syncingId, setSyncingId] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await NayaxSetting.list('-created_date');
      setSettings(safeArray(data));
    } catch (error) {
      console.error('Failed to load Nayax accounts:', error);
      toast.error('Failed to load accounts');
      setSettings([]);
    } finally {
      // No loading state to reset
    }
  };

  const handleSync = async (accountId) => {
    setSyncingId(accountId);
    toast.info(`Starting sync for account ID: ${accountId}...`);
    
    try {
      const response = await syncNayaxData({ settingId: accountId });
      
      if (response?.data?.success) {
        toast.success('Sync completed successfully');
        loadSettings();
      } else {
        throw new Error(response?.data?.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleEdit = (setting = null) => {
    setEditingSetting(setting);
  };

  const handleDelete = (account) => {
    setDeletingSetting(account);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingSetting) return;

    try {
      await NayaxSetting.delete(deletingSetting.id);
      toast.success('Account deleted successfully');
      setIsConfirmOpen(false);
      setDeletingSetting(null);
      await loadSettings();
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Nayax Accounts</h3>
        <Button onClick={() => handleEdit(null)}>
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      <div className="space-y-3">
        {settings.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No Nayax Accounts</h3>
            <p className="text-slate-500 mb-4">Add your first Nayax account to start syncing data.</p>
            <Button onClick={() => handleEdit(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        ) : (
          settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
              <div>
                <p className="font-semibold">{safeString(setting.name)}</p>
                <p className="text-sm text-slate-500">
                  Last Sync: {setting.last_sync_date ? `${formatDistanceToNow(new Date(setting.last_sync_date))} ago` : 'Never'}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${setting.last_sync_status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {setting.last_sync_status || 'N/A'}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleSync(setting.id)} disabled={syncingId === setting.id}>
                  {syncingId === setting.id ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing...</> : <> <RefreshCw className="w-4 h-4 mr-2" /> Sync Now</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(setting)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(setting)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <NayaxAccountFormDialog
        open={!!editingSetting}
        setting={editingSetting}
        onClose={() => setEditingSetting(null)}
        onSave={loadSettings}
      />
      
      {deletingSetting && isConfirmOpen && (
        <ConfirmationDialog
          open={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false);
            setDeletingSetting(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Nayax Account"
          description={`Are you sure you want to delete the account "${safeString(deletingSetting.name)}"? All associated machines will be unlinked.`}
          confirmText="Yes, Delete Account"
        />
      )}
    </>
  );
}