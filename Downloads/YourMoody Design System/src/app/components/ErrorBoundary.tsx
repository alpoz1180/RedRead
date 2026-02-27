import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#2d0f0f] via-[#1a0a0a] to-[#0f0a1a]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            {/* Glassmorphism Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/8 p-8 shadow-2xl">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-3">
                  Bir şeyler ters gitti
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yeniden yükleyerek tekrar deneyin.
                </p>
                {import.meta.env.DEV && this.state.error && (
                  <div className="mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-xs text-red-400 font-mono text-left break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReset}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-[#F4694A] to-[#E94A3D] text-white font-semibold rounded-xl shadow-lg shadow-coral-500/25 hover:shadow-coral-500/40 transition-all duration-200"
                >
                  Yeniden Dene
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="w-full py-3.5 px-6 bg-white/5 backdrop-blur-sm text-white/80 font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  Sayfayı Yenile
                </motion.button>
              </div>
            </div>

            {/* Additional Help Text */}
            <p className="text-center text-white/40 text-xs mt-6">
              Sorun devam ederse, lütfen daha sonra tekrar deneyin.
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
