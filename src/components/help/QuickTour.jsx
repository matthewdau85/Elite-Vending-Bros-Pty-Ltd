import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';

const TourPopover = ({ step, currentStep, totalSteps, onNext, onPrev, onClose }) => {
  const targetElement = document.querySelector(step.selector);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const popoverRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setPosition(rect);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [targetElement]);

  if (!targetElement) return null;

  const popoverStyle = () => {
    const popoverRect = popoverRef.current?.getBoundingClientRect() || { width: 320, height: 150 };
    const gap = 16;
    let top, left;

    switch (step.placement) {
      case 'bottom':
        top = position.bottom + gap;
        left = position.left + position.width / 2 - popoverRect.width / 2;
        break;
      case 'top':
        top = position.top - popoverRect.height - gap;
        left = position.left + position.width / 2 - popoverRect.width / 2;
        break;
      case 'left':
        top = position.top + position.height / 2 - popoverRect.height / 2;
        left = position.left - popoverRect.width - gap;
        break;
      case 'right':
        top = position.top + position.height / 2 - popoverRect.height / 2;
        left = position.right + gap;
        break;
      default: // bottom
        top = position.bottom + gap;
        left = position.left + position.width / 2 - popoverRect.width / 2;
    }
    
    // Adjust to stay within viewport
    if (left < 10) left = 10;
    if (top < 10) top = 10;
    if (left + popoverRect.width > window.innerWidth - 10) left = window.innerWidth - popoverRect.width - 10;
    if (top + popoverRect.height > window.innerHeight - 10) top = window.innerHeight - popoverRect.height - 10;

    return { top, left };
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, ${position.left}px 100%, 
            ${position.left}px ${position.top}px, 
            ${position.right}px ${position.top}px, 
            ${position.right}px ${position.bottom}px, 
            ${position.left}px ${position.bottom}px, 
            ${position.left}px 100%, 100% 100%, 100% 0%
          )`,
        }}
        onClick={onClose}
      />
      <motion.div
        ref={popoverRef}
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-6 w-80"
        style={popoverStyle()}
      >
        <h4 className="font-bold text-lg mb-2">{step.title}</h4>
        <p className="text-sm text-slate-600 mb-4">{step.content}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">{currentStep + 1} / {totalSteps}</span>
          <div className="flex gap-2">
            {currentStep > 0 && <Button variant="ghost" size="sm" onClick={onPrev}><ArrowLeft className="w-4 h-4 mr-1"/> Prev</Button>}
            {currentStep < totalSteps - 1 ? (
              <Button size="sm" onClick={onNext}>Next <ArrowRight className="w-4 h-4 ml-1"/></Button>
            ) : (
              <Button size="sm" onClick={onClose}>Finish</Button>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </motion.div>
    </>
  );
};

export default function QuickTour({ tour, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen || !tour?.steps?.length) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <TourPopover
        step={tour.steps[currentStep]}
        currentStep={currentStep}
        totalSteps={tour.steps.length}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={onClose}
      />
    </AnimatePresence>
  );
}