import React from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '../lib/logger';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error with structured logging
    logger.error('Root Error Boundary Caught Error', error, {
      componentStack: errorInfo.componentStack,
      rootErrorBoundary: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <p className="text-slate-600 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page or contacting support if the problem persists.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <details className="mt-6 text-left text-xs text-slate-500 bg-slate-50 p-3 rounded">
              <summary>Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;