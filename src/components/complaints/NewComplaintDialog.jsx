
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadFile } from '@/api/integrations';
import { toast } from 'sonner';

export default function NewComplaintDialog({ open, onClose, onComplaintAdded, machines, locations }) {
  const [channel, setChannel] = useState('web_form');
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [formData, setFormData] = useState({}); // For machine_id, description, issue_type, amount_claimed_cents, evidence_urls
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset form data when the dialog is opened (or closed, if needed)
    // This ensures a clean state for a new complaint
    if (open) {
      setCustomerName("");
      setCustomerContact("");
      setFormData({});
      setChannel('web_form'); // Reset channel to default if it were to be dynamic
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.info("Uploading evidence...");
    try {
      const { file_url } = await UploadFile({ file });
      const currentUrls = formData.evidence_urls || [];
      setFormData(prev => ({ ...prev, evidence_urls: [...currentUrls, file_url] }));
      toast.success("Evidence uploaded successfully.");
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("File upload failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    try {
      const machine = machines.find(m => m.id === formData.machine_id);
      const dataToSubmit = {
        customer_name: customerName,
        customer_contact: customerContact,
        channel: channel, // Include the channel in the submitted data
        ...formData, // This will include machine_id, description, issue_type, amount_claimed_cents, evidence_urls
        location_id: machine?.location_id,
        amount_claimed_cents: formData.amount_claimed_cents ? parseInt(formData.amount_claimed_cents, 10) : 0,
      };
      await onComplaintAdded(dataToSubmit); // Use onComplaintAdded prop
      setCustomerName(""); // Reset customer name
      setCustomerContact(""); // Reset customer contact
      setFormData({}); // Reset other form data
      setChannel('web_form'); // Reset channel
      onClose(); // Close the dialog
    } catch (error) {
      console.error("Failed to submit complaint", error);
      toast.error("Failed to submit complaint.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record New Complaint</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="customer_contact">Customer Contact (Email/Phone)*</Label>
              <Input
                id="customer_contact"
                required
                value={customerContact}
                onChange={e => setCustomerContact(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="machine_id">Machine*</Label>
            <Select
              required
              onValueChange={value => handleChange('machine_id', value)}
              value={formData.machine_id || ''} // Control select value
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a machine" />
              </SelectTrigger>
              <SelectContent>
                {machines.map(m => <SelectItem key={m.id} value={m.id}>{m.machine_id}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description of Issue*</Label>
            <Textarea
              id="description"
              required
              value={formData.description || ''}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="issue_type">Issue Type</Label>
              <Select
                onValueChange={value => handleChange('issue_type', value)}
                value={formData.issue_type || "vend_fail"} // Default value
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vend_fail">Vend Fail</SelectItem>
                  <SelectItem value="payment_error">Payment Error</SelectItem>
                  <SelectItem value="damaged_product">Damaged Product</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount_claimed_cents">Amount Claimed (cents)</Label>
              <Input
                id="amount_claimed_cents"
                type="number"
                value={formData.amount_claimed_cents || ''}
                onChange={e => handleChange('amount_claimed_cents', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="evidence">Upload Evidence</Label>
            <Input id="evidence" type="file" onChange={handleFileChange} />
            {formData.evidence_urls && formData.evidence_urls.length > 0 && (
              <div className="text-xs text-green-600">
                {formData.evidence_urls.length} file(s) uploaded.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Log Complaint"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
