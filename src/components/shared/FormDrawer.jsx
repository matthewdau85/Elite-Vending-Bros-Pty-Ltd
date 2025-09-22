import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import FormStepper from './FormStepper';

export default function FormDrawer({
  open,
  setOpen,
  title,
  description,
  steps,
  initialData,
  onSubmit,
  submitLabel = "Submit"
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset form when drawer is opened
    if (open) {
      setCurrentStep(0);
      setFormData(initialData);
    }
  }, [open, initialData]);

  const CurrentStepComponent = steps[currentStep].component;
  
  const handleNext = () => {
    const { validate } = steps[currentStep];
    if (validate && !validate(formData)) {
      return; // Validation failed
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-screen flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <FormStepper steps={steps} currentStep={currentStep} />
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <CurrentStepComponent formData={formData} setFormData={setFormData} />
        </div>

        <DialogFooter className="p-6 border-t bg-slate-50 flex justify-between w-full">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}