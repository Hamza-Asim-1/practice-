import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BRAND } from '../../config/branding';

/**
 * FallbackComponent
 * ─────────────────────────────────────────────────────────────────────────────
 * Professional fallback UI for when a component crashes.
 */
const FallbackComponent = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-white rounded-4xl border-2 border-dashed border-black/5">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12" y2="17.01" />
                    </svg>
                </div>
                <h2 className="text-2xl font-black text-black uppercase tracking-tighter mb-4 italic">Something stalled in the vault.</h2>
                <p className="text-black/40 text-sm font-medium mb-8 leading-relaxed">
                    A technical glitch occurred while rendering this section. Our master butchers are investigating.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={resetErrorBoundary}
                        className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-lime hover:text-black transition-all"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-8 border-t border-black/5 text-left">
                        <p className="text-[10px] font-black text-red-500 uppercase mb-2">Dev Debug Info:</p>
                        <pre className="text-[10px] bg-red-50 p-4 rounded-lg overflow-auto max-h-32 text-red-800 font-mono">
                            {error.message}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * AppErrorBoundary
 * ─────────────────────────────────────────────────────────────────────────────
 * Wrapper component to catch runtime errors.
 */
const AppErrorBoundary = ({ children }) => {
    return (
        <ErrorBoundary
            FallbackComponent={FallbackComponent}
            onReset={() => {
                // Reset logic can go here (e.g., clearing some state)
            }}
        >
            {children}
        </ErrorBoundary>
    );
};

export default AppErrorBoundary;
