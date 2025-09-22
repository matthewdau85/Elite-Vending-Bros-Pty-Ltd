
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Phone, Mail, MessageSquare, DollarSign, Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Machine } from '@/api/entities';
import { Location } from '@/api/entities';
import { submitComplaintAndNotify } from '@/api/functions';
import { UploadFile } from '@/api/integrations';

export default function Report() {
  const location = useLocation();
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');

  // Form states
  const [complaintForm, setComplaintForm] = useState({
    customer_name: '',
    customer_contact: '',
    machine_id: '',
    location_id: '',
    issue_type: 'vend_fail',
    description: '',
    amount_claimed_cents: 0,
    evidence_urls: []
  });

  const [refundForm, setRefundForm] = useState({
    customer_name: '',
    customer_contact: '',
    machine_id: '',
    location_id: '',
    amount_cents: 0,
    last_four_digits: '',
    transaction_timestamp: '',
    reason_code: 'vend_failed',
    notes: '',
    evidence_urls: []
  });

  const loadData = useCallback(async () => {
    try {
      const [machinesData, locationsData] = await Promise.all([
        Machine.list(),
        Location.list()
      ]);
      setMachines(machinesData || []);
      setLocations(locationsData || []);

      // Pre-select machine and location if machine ID is provided
      const urlParams = new URLSearchParams(location.search);
      const machineId = urlParams.get('machineId');
      if (machineId && machinesData) {
        const machine = machinesData.find(m => m.id === machineId);
        if (machine) {
          setSelectedMachine(machine);
          const machineLocation = locationsData?.find(l => l.id === machine.location_id);
          if (machineLocation) {
            setSelectedLocation(machineLocation);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [location.search]); // `location.search` is a dependency because it's used inside `loadData`

  useEffect(() => {
    loadData();
    
    // Check for machine ID in URL params
    const urlParams = new URLSearchParams(location.search);
    const machineId = urlParams.get('machineId');
    if (machineId) {
      setComplaintForm(prev => ({ ...prev, machine_id: machineId }));
      setRefundForm(prev => ({ ...prev, machine_id: machineId }));
    }
  }, [loadData, location.search]); // `loadData` is a dependency because it's called here, `location.search` is also needed for the direct param check.

  const handleFileUpload = async (file, formType) => {
    try {
      const { file_url } = await UploadFile({ file });
      
      if (formType === 'complaint') {
        setComplaintForm(prev => ({
          ...prev,
          evidence_urls: [...prev.evidence_urls, file_url]
        }));
      } else {
        setRefundForm(prev => ({
          ...prev,
          evidence_urls: [...prev.evidence_urls, file_url]
        }));
      }
      
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const machineData = machines.find(m => m.id === complaintForm.machine_id);
      const complaintData = {
        ...complaintForm,
        location_id: machineData?.location_id,
        source: 'customer',
        status: 'open'
      };

      const response = await submitComplaintAndNotify({
        complaintData,
        evidenceUrls: complaintForm.evidence_urls,
        recipientEmails: ['support@elitevendingbros.com'] // This would be configurable
      });

      if (response.success) {
        setCaseNumber(`CP-${response.complaint.id.substring(0, 8).toUpperCase()}`);
        setSubmissionSuccess(true);
        toast.success('Complaint submitted successfully');
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      toast.error('Failed to submit complaint: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This would call a similar function for refunds
      const machineData = machines.find(m => m.id === refundForm.machine_id);
      const refundData = {
        ...refundForm,
        location_id: machineData?.location_id,
        source: 'customer',
        status: 'pending',
        customer_contact: refundForm.customer_contact
      };

      // For now, using the complaint submission function as a placeholder
      // In a real implementation, you'd have a similar submitRefundAndNotify function
      const response = await submitComplaintAndNotify({
        complaintData: {
          ...refundData,
          issue_type: 'payment_error',
          description: `Refund request: ${refundForm.notes}`,
          amount_claimed_cents: refundForm.amount_cents,
          requested_refund: true
        },
        evidenceUrls: refundForm.evidence_urls,
        recipientEmails: ['finance@elitevendingbros.com']
      });

      if (response.success) {
        setCaseNumber(`RF-${response.complaint.id.substring(0, 8).toUpperCase()}`);
        setSubmissionSuccess(true);
        toast.success('Refund request submitted successfully');
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      toast.error('Failed to submit refund request: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Request Submitted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Your request has been received and assigned case number:
            </p>
            <div className="bg-slate-100 rounded-lg p-4">
              <code className="text-lg font-mono font-bold text-slate-800">{caseNumber}</code>
            </div>
            <p className="text-sm text-slate-500">
              You will receive a confirmation email shortly. We typically respond within 24 hours.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full mt-6"
            >
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a9859032719af23976947e/7c82f6bd4_Logo2.jpg"
              alt="Elite Vending Bros Logo"
              className="w-12 h-12 object-contain rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customer Support</h1>
              <p className="text-slate-600">Submit a complaint or request a refund</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {selectedMachine && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Machine Information</h3>
              <p className="text-blue-800">
                Machine: {selectedMachine.machine_id}
                {selectedLocation && ` at ${selectedLocation.name}`}
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="complaint" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="complaint" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Report a Problem
            </TabsTrigger>
            <TabsTrigger value="refund" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Request a Refund
            </TabsTrigger>
          </TabsList>

          {/* Complaint Form */}
          <TabsContent value="complaint">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Report a Problem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleComplaintSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="complaint-name">Your Name</Label>
                      <Input
                        id="complaint-name"
                        value={complaintForm.customer_name}
                        onChange={(e) => setComplaintForm(prev => ({...prev, customer_name: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="complaint-contact">Email or Phone</Label>
                      <Input
                        id="complaint-contact"
                        value={complaintForm.customer_contact}
                        onChange={(e) => setComplaintForm(prev => ({...prev, customer_contact: e.target.value}))}
                        placeholder="your.email@example.com or +61 xxx xxx xxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="complaint-machine">Machine</Label>
                    <Select
                      value={complaintForm.machine_id}
                      onValueChange={(value) => {
                        setComplaintForm(prev => ({...prev, machine_id: value}));
                        const machine = machines.find(m => m.id === value);
                        setSelectedMachine(machine);
                        const machineLocation = locations.find(l => l.id === machine?.location_id);
                        setSelectedLocation(machineLocation);
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map(machine => {
                          const location = locations.find(l => l.id === machine.location_id);
                          return (
                            <SelectItem key={machine.id} value={machine.id}>
                              {machine.machine_id} - {location?.name || 'Unknown Location'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="complaint-type">What happened?</Label>
                    <Select
                      value={complaintForm.issue_type}
                      onValueChange={(value) => setComplaintForm(prev => ({...prev, issue_type: value}))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vend_fail">Product didn't dispense</SelectItem>
                        <SelectItem value="payment_error">Payment was charged but no product</SelectItem>
                        <SelectItem value="damaged_product">Product was damaged/expired</SelectItem>
                        <SelectItem value="other">Other issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="complaint-description">Describe the problem</Label>
                    <Textarea
                      id="complaint-description"
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Please provide as much detail as possible..."
                      className="h-32"
                      required
                    />
                  </div>

                  {complaintForm.issue_type === 'payment_error' && (
                    <div>
                      <Label htmlFor="complaint-amount">Amount charged ($)</Label>
                      <Input
                        id="complaint-amount"
                        type="number"
                        step="0.01"
                        value={complaintForm.amount_claimed_cents / 100}
                        onChange={(e) => setComplaintForm(prev => ({
                          ...prev, 
                          amount_claimed_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                        }))}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Upload Photos (optional)</Label>
                    <p className="text-sm text-slate-500 mb-2">
                      Photos help us understand and resolve your issue faster
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'complaint');
                      }}
                      className="mb-2"
                    />
                    {complaintForm.evidence_urls.length > 0 && (
                      <p className="text-sm text-green-600">
                        {complaintForm.evidence_urls.length} file(s) uploaded
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Complaint'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refund Form */}
          <TabsContent value="refund">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  Request a Refund
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRefundSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="refund-name">Your Name</Label>
                      <Input
                        id="refund-name"
                        value={refundForm.customer_name}
                        onChange={(e) => setRefundForm(prev => ({...prev, customer_name: e.target.value}))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="refund-contact">Email or Phone</Label>
                      <Input
                        id="refund-contact"
                        value={refundForm.customer_contact}
                        onChange={(e) => setRefundForm(prev => ({...prev, customer_contact: e.target.value}))}
                        placeholder="your.email@example.com or +61 xxx xxx xxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="refund-machine">Machine</Label>
                    <Select
                      value={refundForm.machine_id}
                      onValueChange={(value) => {
                        setRefundForm(prev => ({...prev, machine_id: value}));
                        const machine = machines.find(m => m.id === value);
                        setSelectedMachine(machine);
                        const machineLocation = locations.find(l => l.id === machine?.location_id);
                        setSelectedLocation(machineLocation);
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map(machine => {
                          const location = locations.find(l => l.id === machine.location_id);
                          return (
                            <SelectItem key={machine.id} value={machine.id}>
                              {machine.machine_id} - {location?.name || 'Unknown Location'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="refund-amount">Amount ($)</Label>
                      <Input
                        id="refund-amount"
                        type="number"
                        step="0.01"
                        value={refundForm.amount_cents / 100}
                        onChange={(e) => setRefundForm(prev => ({
                          ...prev, 
                          amount_cents: Math.round(parseFloat(e.target.value || '0') * 100)
                        }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="refund-card">Last 4 digits of card</Label>
                      <Input
                        id="refund-card"
                        value={refundForm.last_four_digits}
                        onChange={(e) => setRefundForm(prev => ({...prev, last_four_digits: e.target.value}))}
                        placeholder="1234"
                        maxLength={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="refund-time">Transaction time</Label>
                      <Input
                        id="refund-time"
                        type="datetime-local"
                        value={refundForm.transaction_timestamp}
                        onChange={(e) => setRefundForm(prev => ({...prev, transaction_timestamp: e.target.value}))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="refund-reason">Reason for refund</Label>
                    <Select
                      value={refundForm.reason_code}
                      onValueChange={(value) => setRefundForm(prev => ({...prev, reason_code: value}))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vend_failed">Product didn't dispense</SelectItem>
                        <SelectItem value="damaged_product">Product was damaged/expired</SelectItem>
                        <SelectItem value="wrong_product">Wrong product dispensed</SelectItem>
                        <SelectItem value="duplicate_charge">Charged multiple times</SelectItem>
                        <SelectItem value="other">Other reason</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="refund-notes">Additional details</Label>
                    <Textarea
                      id="refund-notes"
                      value={refundForm.notes}
                      onChange={(e) => setRefundForm(prev => ({...prev, notes: e.target.value}))}
                      placeholder="Please provide any additional details..."
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label>Upload Receipt or Photos (optional)</Label>
                    <p className="text-sm text-slate-500 mb-2">
                      Receipt photos help us verify and process your refund faster
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'refund');
                      }}
                      className="mb-2"
                    />
                    {refundForm.evidence_urls.length > 0 && (
                      <p className="text-sm text-green-600">
                        {refundForm.evidence_urls.length} file(s) uploaded
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Refund Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="bg-slate-50">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-800 mb-2">Need immediate help?</h3>
              <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>1800 VENDING</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@elitevendingbros.com</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
