
import React from 'react';
import { BellaProvider } from '@/context/BellaContext';
import { initializePluginSystem } from '@/utils/pluginSystem';

// Initialize systems
initializePluginSystem();

// Enhanced context wrapper with improved error handling
const BellaContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <BellaProvider>{children}</BellaProvider>
    </ErrorBoundary>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Context error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-blue-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-rose-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              There was an error loading the application. Please try refreshing the page.
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-auto max-h-32 mb-4">
              {this.state.error && this.state.error.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BellaContextWrapper;
