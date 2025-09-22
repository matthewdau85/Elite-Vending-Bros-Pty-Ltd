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

export default function DeviceAssignmentDialog({ devices, onClose, onSuccess }) {
  const [assignmentType, setAssignmentType] = useState('machine');
  const [assignedToId, setAssignedToId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!assignedToId.trim()) {
      toast.error('Please specify assignment target');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await bulkDeviceUpdate({
        operation: 'assign',
        device_ids: devices.map(d => d.id),
        data: {
          assignment_type: assignmentType,
          assigned_to_id: assignedToId.trim()
        },
        reason: reason || 'Bulk device assignment'
      });

      if (response.success) {
        toast.success(`Successfully assigned ${response.results.processed} devices`);
        onSuccess();
      } else {
        toast.error('Assignment failed');
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error('Failed to assign devices: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Devices</DialogTitle>
          <DialogDescription>
            Assign {devices.length} selected devices to a machine, location, or user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment Type</Label>
            <select
              value={assignmentType}
              onChange={(e) => setAssignmentType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
            >
              <option value="machine">Machine</option>
              <option value="location">Location</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>
              {assignmentType === 'machine' && 'Machine ID'}
              {assignmentType === 'location' && 'Location ID'}
              {assignmentType === 'user' && 'User Email'}
            </Label>
            <Input
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              placeholder={
                assignmentType === 'machine' ? 'Enter machine ID' :
                assignmentType === 'location' ? 'Enter location ID' :
                'Enter user email'
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for assignment..."
              rows={3}
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
            {isSubmitting ? 'Assigning...' : `Assign ${devices.length} Devices`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}