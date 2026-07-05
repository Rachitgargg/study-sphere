import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error in Study Mode:', error, errorInfo);
  }

  public render() {
    const self = this as any;
    if (self.state.hasError) {
      return (
        self.props.fallback || (
          <div className="p-6 bg-academic-crimson/10 border border-academic-crimson/30 text-academic-cream rounded-xl text-center font-serif space-y-3 max-w-xl mx-auto my-12">
            <span className="text-academic-crimson-bright font-bold uppercase tracking-widest text-xs font-mono">Render Intercepted</span>
            <h4 className="text-md font-bold">Study Mode Render Failure</h4>
            <p className="text-xs text-academic-text-muted">Something went wrong while rendering this study mode.</p>
            <button
              onClick={() => self.setState({ hasError: false })}
              className="mt-2 px-4 py-2 bg-academic-card hover:bg-academic-gold hover:text-academic-black text-academic-cream text-xs rounded border border-academic-card/85 transition-colors cursor-pointer font-bold font-sans"
            >
              Reset View
            </button>
          </div>
        )
      );
    }

    return self.props.children;
  }
}
