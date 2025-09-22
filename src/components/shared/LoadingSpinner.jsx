import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'default', text = 'Loading...', className = '' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6', 
    large: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="text-sm text-slate-600">{text}</span>}
    </div>
  );
}

export function LoadingCard({ title = 'Loading...', rows = 3 }) {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="h-3 bg-slate-200 rounded mb-2 last:mb-0" style={{ width: `${100 - (i * 10)}%` }}></div>
      ))}
    </div>
  );
}

export function LoadingTable({ columns = 5, rows = 8 }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-5 gap-4 mb-4">
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className="h-4 bg-slate-300 rounded"></div>
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 mb-2">
          {Array(columns).fill(0).map((_, j) => (
            <div key={j} className="h-3 bg-slate-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
}