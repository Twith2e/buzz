import React from "react";

type State = {
  hasError: boolean;
  error: Error | null;
  info: React.ErrorInfo | null;
};

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  State
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    this.setState({ error, info });
    // console.error(error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children as any;

    const message =
      this.state.error?.message || "An unexpected error occurred.";
    const stack =
      this.state.error?.stack || this.state.info?.componentStack || "";

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-3xl w-full bg-white dark:bg-gray-900 border rounded shadow p-6">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-red-600 wrap-break-word">{message}</p>

          {stack && (
            <details className="mt-4 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              <summary className="cursor-pointer">Show details</summary>
              <pre className="mt-2 text-xs overflow-auto max-h-64">{stack}</pre>
            </details>
          )}

          <div className="mt-4 text-right">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
