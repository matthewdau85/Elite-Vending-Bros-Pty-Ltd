import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function FormStepper({ steps, currentStep }) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={cn('relative', stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '')}>
            {stepIdx < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-blue-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white" aria-current="step">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-slate-200" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
              </>
            )}
            <div className="absolute top-10 w-max -translate-x-1/2 left-1/2">
                <span className={`text-xs ${stepIdx <= currentStep ? 'font-semibold text-blue-600' : 'text-slate-500'}`}>{step.name}</span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}