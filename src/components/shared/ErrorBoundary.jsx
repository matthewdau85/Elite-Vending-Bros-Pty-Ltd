import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  
  componentDidCatch(error, info) { 
    /* You can log the error to a service here */ 
    console.error("ErrorBoundary caught an error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border rounded-lg bg-red-50 text-red-700">
          <h3 className="font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm opacity-80">A component failed to render. Try adjusting filters or reloading.</p>
        </div>
      );
    }
    return this.props.children;
  }
}