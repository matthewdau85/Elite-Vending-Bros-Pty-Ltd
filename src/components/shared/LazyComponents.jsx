import React, { Suspense } from 'react';
import { CardSkeleton, TableSkeleton } from './Skeletons';

// Lazy load heavy chart components to reduce initial bundle size
export const LazyAreaChart = React.lazy(() => 
  import('recharts').then(module => ({ 
    default: React.forwardRef((props, ref) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = module;
      return (
        <ResponsiveContainer ref={ref} {...props}>
          <AreaChart {...props}>
            {props.children}
          </AreaChart>
        </ResponsiveContainer>
      );
    })
  }))
);

export const LazyLineChart = React.lazy(() => 
  import('recharts').then(module => ({ 
    default: React.forwardRef((props, ref) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = module;
      return (
        <ResponsiveContainer ref={ref} {...props}>
          <LineChart {...props}>
            {props.children}
          </LineChart>
        </ResponsiveContainer>
      );
    })
  }))
);

export const LazyBarChart = React.lazy(() => 
  import('recharts').then(module => ({ 
    default: React.forwardRef((props, ref) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = module;
      return (
        <ResponsiveContainer ref={ref} {...props}>
          <BarChart {...props}>
            {props.children}
          </BarChart>
        </ResponsiveContainer>
      );
    })
  }))
);

// Wrapper components with proper loading states
export const OptimizedAreaChart = React.forwardRef((props, ref) => (
  <Suspense fallback={
    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
      <div className="text-slate-400">Loading chart...</div>
    </div>
  }>
    <LazyAreaChart ref={ref} {...props} />
  </Suspense>
));

export const OptimizedLineChart = React.forwardRef((props, ref) => (
  <Suspense fallback={
    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
      <div className="text-slate-400">Loading chart...</div>
    </div>
  }>
    <LazyLineChart ref={ref} {...props} />
  </Suspense>
));

export const OptimizedBarChart = React.forwardRef((props, ref) => (
  <Suspense fallback={
    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse">
      <div className="text-slate-400">Loading chart...</div>
    </div>
  }>
    <LazyBarChart ref={ref} {...props} />
  </Suspense>
));

// Heavy table component with virtualization for large datasets
export const LazyDataTable = React.lazy(() => import('./DataTable'));

export const OptimizedDataTable = React.memo((props) => (
  <Suspense fallback={<TableSkeleton rows={10} columns={props.columns?.length || 5} />}>
    <LazyDataTable {...props} />
  </Suspense>
));

OptimizedAreaChart.displayName = 'OptimizedAreaChart';
OptimizedLineChart.displayName = 'OptimizedLineChart';
OptimizedBarChart.displayName = 'OptimizedBarChart';
OptimizedDataTable.displayName = 'OptimizedDataTable';