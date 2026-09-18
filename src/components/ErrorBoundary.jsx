import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Reelist ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" role="alert">
          <div className="error-boundary-card">
            <div className="error-boundary-icon" aria-hidden="true">
              <AlertTriangle size={36} color="#e8b54d" />
            </div>
            <h2 className="error-boundary-title">Reel Encountered a Glitch</h2>
            <p className="error-boundary-desc">
              Something unexpected happened while projecting this scene. Your saved watchlist,
              settings, and session remain completely safe.
            </p>
            {this.state.error && (
              <pre className="error-boundary-details">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn-primary error-boundary-btn"
                onClick={this.handleReload}
              >
                <RotateCcw size={15} />
                <span>Reload Reelist</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
