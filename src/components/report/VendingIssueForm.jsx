
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";
import { UploadFile } from "@/api/integrations";
import { processPublicComplaint } from '@/api/functions';
import { createServiceTicket } from '@/api/functions';

export default function VendingIssueForm({ machines = [], locations = [] }) {
  const [formData, setFormData] = useState({
    customer_contact: '',
    customer_name: '',
    machine_id: '', // Changed from machine_location to machine_id
    issue_type: 'vend_fail',
    description: '',
    amount_claimed: '',
  });
  const [files, setFiles] = useState([]); // Stores File objects selected by user
  const [isLoading, setIsLoading] = useState(false); // Combines isSubmitting and isUploading
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
    }
    // Clear the input after selection to allow selecting the same file again if needed
    e.target.value = null;
  };

  const validateForm = () => {
    if (!formData.customer_contact || !formData.description) {
      toast.error("Please fill in all required fields: Email/Phone and Description.");
      return false;
    }
    if (formData.amount_claimed && isNaN(parseFloat(formData.amount_claimed))) {
      toast.error("Please enter a valid number for 'Amount you paid'.");
      return false;
    }
    return true;
  };

  const ensureTicketCreated = async (complaint, serviceTicket) => {
    try {
      if (serviceTicket?.id) {
        console.log('Service ticket already created by backend:', serviceTicket.id);
        return serviceTicket.id;
      }
      
      console.log('Backend did not create a ticket, creating one from frontend fallback.');
      const payload = {
        title: `Complaint: ${complaint.issue_type || 'Customer Issue'}`,
        description: complaint.description,
        priority: complaint.severity || 'medium', // Assuming severity might be on complaint or default to medium
        machine_id: complaint.machine_id || null,
        location_id: complaint.location_id || null,
        photos: complaint.evidence_urls || [],
        related_complaint_id: complaint.id
      };
      
      const { data: created } = await createServiceTicket(payload);
      const newTicketId = created?.ticket?.id;

      if (newTicketId) {
        console.log('Fallback service ticket created:', newTicketId);
      }
      return newTicketId;

    } catch (err) {
      console.error('Failed to create ticket from complaint fallback:', err);
      toast.error('Failed to create a corresponding service ticket. Please check system logs.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    let uploadedUrls = [];

    if (files.length > 0) {
      toast.info(`Uploading ${files.length} evidence file(s)...`);
      try {
        const uploadPromises = files.map(file => UploadFile({ file }));
        const results = await Promise.all(uploadPromises);
        uploadedUrls = results.map(r => r.file_url);
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully.`);
      } catch (error) {
        console.error("File upload failed:", error);
        toast.error("File upload failed. Please try again.");
        setIsLoading(false);
        return; // Stop submission if file upload fails
      }
    }
    
    // Construct complaint data
    const complaintPayload = {
      channel: 'web_form',
      customer_name: formData.customer_name || null,
      customer_contact: formData.customer_contact,
      machine_id: formData.machine_id || null, // Use selected machine ID
      location_id: formData.machine_id ? machines.find(m => m.id === formData.machine_id)?.location_id : null, // Derive location_id
      issue_type: formData.issue_type,
      description: formData.description,
      amount_claimed_cents: Number(formData.amount_claimed) * 100 || 0,
      evidence_urls: uploadedUrls
    };

    try {
      const response = await processPublicComplaint({
        complaintData: complaintPayload
      });
      
      if (response?.data?.success) {
        setSubmitted(true);
        toast.success("Your complaint has been submitted successfully!");
        // Ensure a ticket is created
        await ensureTicketCreated(response.data.complaint, response.data.service_ticket);

      } else {
        throw new Error(response?.data?.error || 'An unknown error occurred while submitting the complaint.');
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error(`Failed to submit complaint: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="text-center p-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h2>
          <p className="text-green-700 mb-4">
            Your complaint has been submitted successfully. We'll review it and get back to you shortly.
          </p>
          <p className="text-sm text-green-600">
            You should receive a confirmation email if you provided an email address.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Machine Issue Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer_contact">Email or Phone Number *</Label>
              <Input
                id="customer_contact"
                required
                value={formData.customer_contact}
                onChange={(e) => handleInputChange('customer_contact', e.target.value)}
                placeholder="your.email@example.com or +61400123456"
              />
              <p className="text-xs text-slate-500 mt-1">We'll use this to contact you about your issue.</p>
            </div>

            <div>
              <Label htmlFor="customer_name">Your Name (Optional)</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="machine_id">Affected Machine (Optional)</Label>
              <Select value={formData.machine_id} onValueChange={(value) => handleInputChange('machine_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a machine..." />
                </SelectTrigger>
                <SelectContent>
                  {machines.length === 0 ? (
                    <SelectItem value={null} disabled>No machines available</SelectItem>
                  ) : (
                    <>
                      <SelectItem value={null}>Not sure / Other</SelectItem>
                      {machines.map((machine) => (
                        <SelectItem key={machine.id} value={machine.id}>
                          {machine.name} {machine.location_name ? `(${machine.location_name})` : ''}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Select the machine you had an issue with.</p>
            </div>

            <div>
              <Label htmlFor="issue_type">Type of Issue *</Label>
              <Select value={formData.issue_type} onValueChange={(value) => handleInputChange('issue_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vend_fail">Money taken but no product dispensed</SelectItem>
                  <SelectItem value="payment_error">Payment/card reader problem</SelectItem>
                  <SelectItem value="damaged_product">Received damaged/expired product</SelectItem>
                  <SelectItem value="other">Other issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Describe what happened *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please describe the issue in detail..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="amount_claimed">Amount you paid (if applicable)</Label>
              <Input
                id="amount_claimed"
                type="number"
                step="0.01"
                value={formData.amount_claimed}
                onChange={(e) => handleInputChange('amount_claimed', e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 mt-1">If you lost money, enter the amount here.</p>
            </div>

            <div>
              <Label htmlFor="evidence">Upload Photo/Video Evidence (Optional)</Label>
              <Input
                id="evidence"
                type="file"
                multiple // Allow multiple files
                onChange={handleFileUpload}
                accept="image/*,video/*" // Allow images and videos
                disabled={isLoading}
              />
              {files.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {files.length} file(s) selected: {files.map(f => f.name).join(', ')}
                  <Button variant="ghost" size="sm" className="ml-2 text-red-500" onClick={() => setFiles([])}>Clear</Button>
                </p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
