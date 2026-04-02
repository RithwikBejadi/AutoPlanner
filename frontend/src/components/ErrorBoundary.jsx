import React, { Component } from 'react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-surface-container rounded-2xl border border-outline-variant/10 p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error" style={{ fontSize: 28 }}>
                  error
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-on-surface font-headline">
                  Something went wrong
                </h1>
                <p className="text-sm text-on-surface-variant mt-1">
                  The application encountered an unexpected error
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
                <p className="text-sm text-error font-mono break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
                <summary className="text-sm font-medium text-on-surface cursor-pointer hover:text-primary transition-colors">
                  Stack trace (development only)
                </summary>
                <pre className="mt-3 text-xs text-outline font-mono overflow-auto custom-scrollbar">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                icon="refresh"
                onClick={this.handleReset}
              >
                Reload Application
              </Button>
              <Button
                variant="ghost"
                icon="arrow_back"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>

            <p className="text-xs text-outline">
              If this error persists, please contact support or try clearing your browser cache.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
