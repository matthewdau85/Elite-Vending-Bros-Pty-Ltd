import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { bulkDeviceUpdate } from '@/api/functions';

export default function DeviceRMADialog({ devices, onClose, onSuccess }) {
  const [rmaReason, setRmaReason] = useState('defective');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description for the RMA');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await bulkDeviceUpdate({
        operation: 'initiate_rma',
        device_ids: devices.map(d => d.id),
        data: {
          rma_reason: rmaReason,
          rma_description: description
        },
        reason: `Bulk RMA initiation: ${rmaReason}`
      });

      if (response.success) {
        toast.success(`Successfully initiated RMA for ${response.results.processed} devices`);
        onSuccess();
      } else {
        toast.error('RMA initiation failed');
      }
    } catch (error) {
      console.error('RMA error:', error);
      toast.error('Failed to initiate RMA: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate RMA</DialogTitle>
          <DialogDescription>
            Initiate RMA (Return Merchandise Authorization) for {devices.length} selected devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>RMA Reason</Label>
            <select
              value={rmaReason}
              onChange={(e) => setRmaReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="defective">Defective</option>
              <option value="warranty">Warranty Claim</option>
              <option value="upgrade">Upgrade</option>
              <option value="end_of_life">End of Life</option>
              <option value="damage">Physical Damage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue or reason for RMA..."
              rows={4}
              required
            />
          </div>

          <div className="text-sm text-slate-600">
            <strong>Selected Devices:</strong>
            <div className="mt-1 max-h-20 overflow-y-auto">
              {devices.map(device => (
                <div key={device.id} className="text-xs">
                  {device.device_id} ({device.manufacturer} {device.model})
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Initiating RMA...' : `Initiate RMA for ${devices.length} Devices`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}