
import React, { useState, useEffect, useCallback } from 'react';
import { ApiKey } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_SCOPES = [
  { id: 'machines:read', label: 'Read Machines' },
  { id: 'routes:read', label: 'Read Routes' },
  { id: 'telemetry:read', label: 'Read Telemetry' },
  { id: 'settlements:read', label: 'Read Settlements' },
  { id: 'inventory:read', label: 'Read Inventory' },
];

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    try {
      const keys = await ApiKey.list('-created_date');
      setApiKeys(keys);
    } catch (error) {
      toast.error('Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName || selectedScopes.length === 0) {
      toast.error('Please provide a name and select at least one scope.');
      return;
    }

    try {
      const keyPrefix = `evb_sk_${crypto.randomUUID().slice(0, 8)}`;
      const secretPart = crypto.randomUUID().replaceAll('-', '');
      const fullKey = `${keyPrefix}_${secretPart}`;
      
      // In a real app, you'd use a secure hashing function on the server.
      // We simulate this by just storing the prefix and a dummy hash.
      const hashedKey = `hashed_${secretPart}`; // This is a placeholder for a real hash

      await ApiKey.create({
        name: newKeyName,
        key_prefix: keyPrefix,
        hashed_key: hashedKey,
        scopes: selectedScopes,
        status: 'active'
      });
      
      setGeneratedKey(fullKey);
      toast.success('API Key created successfully!');
      setNewKeyName('');
      setSelectedScopes([]);
      loadKeys();
    } catch (error) {
      toast.error('Failed to create API key.');
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this key? This action cannot be undone.')) return;
    try {
      await ApiKey.update(keyId, { status: 'revoked' });
      setApiKeys(currentKeys =>
        currentKeys.map(key =>
          key.id === keyId ? { ...key, status: 'revoked' } : key
        )
      );
      toast.success('API Key revoked.');
    } catch (error) {
      toast.error('Failed to revoke API key.');
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="w-4 h-4 mr-2"/> Create New API Key</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              This key will have the selected permissions. The secret key will only be shown once.
            </DialogDescription>
          </DialogHeader>
          {!generatedKey ? (
            <form onSubmit={handleCreateKey}>
              <div className="space-y-4 py-4">
                <Input 
                  placeholder="Key Name (e.g., Partner Integration)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <div>
                  <h4 className="font-medium mb-2">Scopes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_SCOPES.map(scope => (
                      <div key={scope.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={scope.id} 
                          onCheckedChange={(checked) => {
                            setSelectedScopes(prev => 
                              checked ? [...prev, scope.id] : prev.filter(s => s !== scope.id)
                            )
                          }}
                        />
                        <label htmlFor={scope.id} className="text-sm">{scope.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Key</Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="py-4 space-y-4">
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                Please copy this secret key and store it securely. You will not be able to see it again.
              </p>
              <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-md">
                <Input readOnly value={generatedKey} className="font-mono"/>
                <Button variant="ghost" size="icon" onClick={() => {
                  navigator.clipboard.writeText(generatedKey);
                  toast.success('Copied to clipboard!');
                }}>
                  <Copy className="w-4 h-4"/>
                </Button>
              </div>
              <DialogFooter>
                  <Button onClick={() => { setGeneratedKey(null); setIsDialogOpen(false); }}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : (
              apiKeys.map(key => (
                <TableRow key={key.id}>
                  <TableCell>{key.name}</TableCell>
                  <TableCell className="font-mono">{key.key_prefix}</TableCell>
                  <TableCell>{key.status}</TableCell>
                  <TableCell>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      disabled={key.status === 'revoked'}
                      onClick={() => handleRevokeKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2"/> Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
