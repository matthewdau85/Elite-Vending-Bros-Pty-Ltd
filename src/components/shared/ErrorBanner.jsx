import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ErrorBanner({ 
  error, 
  onRetry, 
  requestId, 
  variant = 'error',
  showDiagnostics = true,
  className = ""
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  const copyRequestId = () => {
    if (requestId) {
      navigator.clipboard.writeText(requestId);
      toast.success('Request ID copied to clipboard');
    }
  };

  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred. Please try again.';
  };

  const getErrorCode = () => {
    if (error?.code) return error.code;
    if (error?.status) return `HTTP ${error.status}`;
    return null;
  };

  return (
    <Alert className={`border-red-200 ${className}`} variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium text-red-800 mb-1">
              {getErrorMessage()}
            </p>
            
            {getErrorCode() && (
              <p className="text-sm text-red-600 mb-2">
                Error Code: {getErrorCode()}
              </p>
            )}

            {showDiagnostics && (requestId || error?.details) && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-red-700 hover:text-red-800 hover:bg-red-50 p-0 h-auto font-normal"
                >
                  {showDetails ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                  {showDetails ? 'Hide' : 'Show'} diagnostic details
                </Button>
                
                {showDetails && (
                  <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                    {requestId && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-red-700">Request ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-2 py-1 rounded border">
                            {requestId}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm" 
                            onClick={copyRequestId}
                            className="p-1 h-auto text-red-600 hover:text-red-700"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {error?.details && (
                      <div className="text-xs text-red-600 mt-2">
                        <pre className="whitespace-pre-wrap font-mono">
                          {JSON.stringify(error.details, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-2 border-t border-red-200">
                      <p className="text-xs text-red-600 mb-2">
                        If this issue persists, please contact support with the request ID above.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:text-red-800 hover:bg-red-100 p-0 h-auto font-normal"
                        onClick={() => window.open('mailto:support@elitevendingbros.com?subject=Error%20Report&body=' + encodeURIComponent(`Request ID: ${requestId}\nError: ${getErrorMessage()}`))}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Contact Support
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {onRetry && (
            <Button 
              onClick={handleRetry}
              disabled={retrying}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Preset error banners for common scenarios
export const ErrorBanners = {
  NetworkError: (props) => (
    <ErrorBanner
      error="Unable to connect to the server. Please check your internet connection and try again."
      {...props}
    />
  ),
  
  LoadError: (props) => (
    <ErrorBanner
      error="Failed to load data. This might be a temporary issue with our servers."
      {...props}
    />
  ),
  
  SaveError: (props) => (
    <ErrorBanner
      error="Unable to save your changes. Please try again or contact support if the issue persists."
      {...props}
    />
  ),
  
  AuthError: (props) => (
    <ErrorBanner
      error="Your session has expired. Please refresh the page to log in again."
      onRetry={() => window.location.reload()}
      {...props}
    />
  ),
  
  ValidationError: (props) => (
    <ErrorBanner
      error="Please check your input and correct any errors before submitting."
      showDiagnostics={false}
      {...props}
    />
  )
};