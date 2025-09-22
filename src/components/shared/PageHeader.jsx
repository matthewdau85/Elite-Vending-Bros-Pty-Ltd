import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PageHeader({ title, subtitle, buttonText, onButtonClick, icon: Icon }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8 text-blue-600" />}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5 mr-2" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}