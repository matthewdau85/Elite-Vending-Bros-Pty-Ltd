
import React from 'react';
import { toast } from 'sonner';
import { submitComplaintAndNotify } from '@/api/functions';
import FormDrawer from '../shared/FormDrawer';
import AttachmentUploader from '../shared/AttachmentUploader';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Machine } from '@/api/entities';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/api/entities';

const ComplaintDetailsStep = ({ formData, setFormData, machines }) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="complaint-machine">Machine (if known)</Label>
      <Select value={formData.machine_id} onValueChange={(value) => setFormData(p => ({...p, machine_id: value}))}>
        <SelectTrigger id="complaint-machine"><SelectValue placeholder="Select a machine..." /></SelectTrigger>
        <SelectContent>
          {machines.map(m => <SelectItem key={m.id} value={m.id}>{m.machine_id} - {m.model}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
     <div>
      <Label htmlFor="complaint-customer_contact">Customer Contact (Email/Phone) *</Label>
      <Input id="complaint-customer_contact" value={formData.customer_contact} onChange={e => setFormData(p => ({...p, customer_contact: e.target.value}))} />
    </div>
    <div>
      <Label htmlFor="complaint-description">Description of Issue *</Label>
      <Textarea id="complaint-description" value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="complaint-issue_type">Issue Type</Label>
        <Select value={formData.issue_type} onValueChange={(value) => setFormData(p => ({...p, issue_type: value}))}>
            <SelectTrigger id="complaint-issue_type"><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="vend_fail">Vend Fail</SelectItem>
                <SelectItem value="payment_error">Payment Error</SelectItem>
                <SelectItem value="damaged_product">Damaged Product</SelectItem>
                <SelectItem value="other">Other</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="complaint-amount_claimed">Amount Claimed ($)</Label>
        <Input type="number" id="complaint-amount_claimed" value={formData.amount_claimed_cents / 100} onChange={e => setFormData(p => ({...p, amount_claimed_cents: e.target.value * 100}))} />
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="complaint-requested_refund" checked={formData.requested_refund} onCheckedChange={(checked) => setFormData(p => ({...p, requested_refund: checked}))} />
      <Label htmlFor="complaint-requested_refund">Customer is requesting a refund</Label>
    </div>
  </div>
);

const AttachmentsStep = ({ formData, setFormData }) => (
  <AttachmentUploader onUploadComplete={(urls) => setFormData(prev => ({...prev, evidence_urls: urls }))} />
);

const ReviewStep = ({ formData }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-lg">Review Complaint</h3>
    <div><strong>Customer:</strong> {formData.customer_contact}</div>
    <div><strong>Issue:</strong> {formData.description}</div>
    {formData.requested_refund && <div><strong>Refund Claimed:</strong> ${(formData.amount_claimed_cents / 100).toFixed(2)}</div>}
  </div>
);

export default function ComplaintCreateDrawer({ open, setOpen, onComplaintAdded }) {
  const [machines, setMachines] = React.useState([]);
  React.useEffect(() => { Machine.list().then(setMachines) }, []);

  const initialData = {
    machine_id: '',
    customer_name: '',
    customer_contact: '',
    issue_type: 'vend_fail',
    description: '',
    amount_claimed_cents: 0,
    requested_refund: false,
    evidence_urls: []
  };

  const steps = [
    { name: 'Details', component: (props) => <ComplaintDetailsStep {...props} machines={machines} />, validate: (data) => {
        if (!data.customer_contact || !data.description) {
            toast.error('Please provide customer contact and a description.');
            return false;
        }
        return true;
    }},
    { name: 'Evidence', component: AttachmentsStep },
    { name: 'Review & Submit', component: ReviewStep }
  ];

  const handleSubmit = async (formData) => {
    try {
      const user = await User.me();
      const payload = {...formData, reporter_email: user.email};
      const response = await submitComplaintAndNotify(payload);
      
      if (response?.data?.success) {
        toast.success('Complaint Logged Successfully!');
        onComplaintAdded?.(response.data.complaint);
        setOpen(false);
      } else {
        throw new Error(response?.data?.error || 'Failed to submit complaint');
      }
    } catch (e) {
      toast.error('Submission Failed', { description: e.message });
    }
  };

  return (
    <FormDrawer
      open={open}
      setOpen={setOpen}
      title="Log New Customer Complaint"
      description="Follow the steps to record a new customer issue."
      steps={steps}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitLabel="Log Complaint"
    />
  );
}
