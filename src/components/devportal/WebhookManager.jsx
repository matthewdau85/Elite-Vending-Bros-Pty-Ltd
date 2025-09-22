import React, { useState, useEffect, useCallback } from 'react';
import { WebhookSubscription } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_TYPES = ["vend.success", "alert.triggered", "settlement.posted", "route.published"];

export default function WebhookManager() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubscription, setNewSubscription] = useState({ event_type: '', target_url: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSecret, setNewSecret] = useState(null);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const subs = await WebhookSubscription.list('-created_date');
      setSubscriptions(subs);
    } catch (error) {
      toast.error('Failed to load webhook subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!newSubscription.event_type || !newSubscription.target_url) {
      toast.error('Please select an event type and enter a target URL.');
      return;
    }
    try {
      const secret = `whsec_${crypto.randomUUID().replaceAll('-', '')}`;
      await WebhookSubscription.create({
        ...newSubscription,
        signing_secret: secret,
        status: 'active'
      });
      setNewSecret(secret);
      toast.success('Webhook subscription created!');
      loadSubscriptions();
    } catch (error) {
      toast.error('Failed to create subscription.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this webhook subscription?')) return;
    try {
      await WebhookSubscription.delete(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      toast.success('Subscription deleted.');
    } catch (error) {
      toast.error('Failed to delete subscription.');
    }
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewSecret(null);
    setNewSubscription({ event_type: '', target_url: '' });
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2"/> Add Webhook</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Webhook Subscription</DialogTitle>
            <DialogDescription>
              Get notified when events happen in your account.
            </DialogDescription>
          </DialogHeader>
          {!newSecret ? (
            <form onSubmit={handleCreateSubscription}>
              <div className="space-y-4 py-4">
                <Select onValueChange={(value) => setNewSubscription(p => ({...p, event_type: value}))}>
                  <SelectTrigger><SelectValue placeholder="Select Event Type" /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input 
                  placeholder="https://your-api.com/webhook-handler" 
                  value={newSubscription.target_url}
                  onChange={(e) => setNewSubscription(p => ({...p, target_url: e.target.value}))}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Create Subscription</Button>
              </DialogFooter>
            </form>
          ) : (
             <div className="py-4 space-y-4">
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                Please copy this signing secret. It's used to verify that webhooks are from us. You will not be able to see it again.
              </p>
              <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-md">
                <Input readOnly value={newSecret} className="font-mono"/>
                <Button variant="ghost" size="icon" onClick={() => {
                  navigator.clipboard.writeText(newSecret);
                  toast.success('Copied to clipboard!');
                }}>
                  <Copy className="w-4 h-4"/>
                </Button>
              </div>
              <DialogFooter>
                  <Button onClick={handleDialogClose}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : (
              subscriptions.map(sub => (
                <TableRow key={sub.id}>
                  <TableCell className="font-mono">{sub.event_type}</TableCell>
                  <TableCell>{sub.target_url}</TableCell>
                  <TableCell>{sub.status}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(sub.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
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