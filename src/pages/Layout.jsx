
import React, { Suspense } from 'react';
import { Toaster } from 'sonner';
import AppShell from './components/layout/AppShell';
import { PageSkeleton } from './components/shared/Skeletons';
import { Button } from './components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex h-screen w-screen flex-col items-center justify-center bg-slate-100"
          role="alert"
        >
          <div className="text-center p-8 bg-white rounded-lg shadow-xl">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-slate-800">Something went wrong</h2>
            <p className="mt-2 text-slate-600">
              We've encountered an unexpected error. Please try again.
            </p>
            <pre className="mt-4 p-2 text-left text-xs text-red-700 bg-red-50 rounded overflow-auto max-h-32">
              {this.state.error?.message}
            </pre>
            <Button onClick={() => window.location.reload()} className="mt-6">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <AppShell currentPageName={currentPageName}>
            {children}
          </AppShell>
          <Toaster position="bottom-right" richColors />
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
