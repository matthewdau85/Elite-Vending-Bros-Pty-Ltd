import React, { useState } from 'react';
import { toast } from 'sonner';
import { createServiceTicket } from '@/api/functions';
import { Machine, Location } from '@/api/entities';
import FormDrawer from '../shared/FormDrawer';
import FormStepper from '../shared/FormStepper';
import AttachmentUploader from '../shared/AttachmentUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';

const STEPS = [
  { name: 'Details' },
  { name: 'Attachments' },
  { name: 'Review' }
];

const PRIORITY_INFO = {
  urgent: { label: 'Urgent', sla: '4 hours', color: 'bg-red-100 text-red-800', description: 'Critical issues affecting operations' },
  high: { label: 'High', sla: '24 hours', color: 'bg-orange-100 text-orange-800', description: 'Important issues requiring prompt attention' },
  medium: { label: 'Medium', sla: '72 hours', color: 'bg-yellow-100 text-yellow-800', description: 'Standard operational issues' },
  low: { label: 'Low', sla: '7 days', color: 'bg-blue-100 text-blue-800', description: 'Non-urgent maintenance items' }
};

const CATEGORIES = [
  { value: 'mechanical', label: 'Mechanical Issue' },
  { value: 'electrical', label: 'Electrical Problem' },
  { value: 'software', label: 'Software/Firmware' },
  { value: 'cleaning', label: 'Cleaning Required' },
  { value: 'restocking', label: 'Restocking Issue' },
  { value: 'security', label: 'Security Concern' },
  { value: 'coin_mechanism', label: 'Coin Mechanism' },
  { value: 'card_reader', label: 'Card Reader' },
  { value: 'temperature', label: 'Temperature Control' },
  { value: 'other', label: 'Other' }
];

export default function TicketCreateDrawer({ open, setOpen }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    machine_id: '',
    location_id: '',
    category: 'mechanical',
    priority: 'medium',
    title: '',
    description: '',
    attachments: []
  });
  const [validationErrors, setValidationErrors] = useState({});

  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [machinesData, locationsData] = await Promise.all([
        Machine.list(),
        Location.list()
      ]);
      setMachines(machinesData || []);
      setLocations(locationsData || []);
    } catch (error) {
      toast.error('Failed to load form data');
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.machine_id) errors.machine_id = 'Machine is required';
      if (!formData.title?.trim()) errors.title = 'Title is required';
      if (!formData.description?.trim()) errors.description = 'Description is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(0)) {
      setCurrentStep(0);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedMachine = machines.find(m => m.id === formData.machine_id);
      const ticketData = {
        ...formData,
        location_id: selectedMachine?.location_id || formData.location_id,
        photos: formData.attachments
      };
      
      const response = await createServiceTicket(ticketData);
      
      if (response.data?.success) {
        toast.success('Service ticket created successfully');
        setOpen(false);
        resetForm();
        // Optionally navigate to ticket detail
        // navigate(`/servicetickets/${response.data.ticket.id}`);
      } else {
        throw new Error(response.data?.error || 'Failed to create ticket');
      }
    } catch (error) {
      toast.error('Failed to create service ticket: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      machine_id: '',
      location_id: '',
      category: 'mechanical',
      priority: 'medium',
      title: '',
      description: '',
      attachments: []
    });
    setValidationErrors({});
  };

  const selectedMachine = machines.find(m => m.id === formData.machine_id);
  const selectedLocation = locations.find(l => l.id === (selectedMachine?.location_id || formData.location_id));
  const priorityInfo = PRIORITY_INFO[formData.priority];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Details
        return (
          <div className="space-y-6">
            {/* Machine Selection */}
            <div className="space-y-2">
              <Label htmlFor="machine">Machine *</Label>
              <Select 
                value={formData.machine_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, machine_id: value }))}
              >
                <SelectTrigger className={validationErrors.machine_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a machine" />
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
              {validationErrors.machine_id && (
                <p className="text-sm text-red-600">{validationErrors.machine_id}</p>
              )}
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{info.label}</span>
                          <Badge className={info.color} size="sm">SLA: {info.sla}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SLA Information */}
            {priorityInfo && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>SLA Target:</strong> {priorityInfo.sla} • {priorityInfo.description}
                </AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-600">{validationErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about the issue, including steps to reproduce if applicable"
                rows={4}
                className={validationErrors.description ? 'border-red-500' : ''}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>
          </div>
        );

      case 1: // Attachments
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Add Supporting Files</h3>
              <p className="text-slate-600 mb-4">
                Upload photos, videos, or documents that help explain the issue.
              </p>
            </div>
            
            <AttachmentUploader
              onUploadComplete={(urls) => setFormData(prev => ({ ...prev, attachments: urls }))}
            />
          </div>
        );

      case 2: // Review
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Service Ticket</h3>
            </div>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  {formData.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Machine:</span>
                    <p className="font-medium">{selectedMachine?.machine_id || 'Not selected'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Location:</span>
                    <p className="font-medium">{selectedLocation?.name || 'Not determined'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Category:</span>
                    <p className="font-medium">{CATEGORIES.find(c => c.value === formData.category)?.label}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Priority:</span>
                    <Badge className={priorityInfo?.color}>
                      {priorityInfo?.label} (SLA: {priorityInfo?.sla})
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-slate-500">Description:</span>
                  <p className="mt-1 text-sm">{formData.description}</p>
                </div>

                {formData.attachments.length > 0 && (
                  <div>
                    <span className="text-sm text-slate-500">Attachments:</span>
                    <p className="text-sm font-medium">{formData.attachments.length} file(s) uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SLA Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Once created, this ticket will need to be resolved within <strong>{priorityInfo?.sla}</strong> to meet SLA requirements. 
                Escalation notifications will be sent if the ticket approaches this deadline.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={setOpen}
      title="Create Service Ticket"
      description="Report an issue that requires technical attention"
    >
      <div className="space-y-6">
        <FormStepper steps={STEPS} currentStep={currentStep} />
        
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </FormDrawer>
  );
}