import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 48, message = "Loading data..." }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow */}
                <div className="absolute inset-0 blur-2xl bg-accent-lime/20 animate-pulse rounded-full group-hover:bg-accent-lime/30 transition-all" />
                
                {/* Premium Spinner SVG */}
                <svg 
                    width={size} 
                    height={size} 
                    viewBox="0 0 50 50" 
                    className="relative z-10 animate-spin text-accent-lime drop-shadow-sm"
                >
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="31.4 31.4"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeOpacity="0.1"
                    />
                </svg>
                
                {/* Center Dot */}
                <div className="absolute w-1.5 h-1.5 bg-accent-lime rounded-full shadow-[0_0_8px_rgba(186,205,56,0.6)]" />
            </div>

            {message && (
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-black/40 italic">
                        {message}
                    </p>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <div 
                                key={i} 
                                className="w-1 h-1 bg-accent-lime/30 rounded-full animate-bounce" 
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-9999 bg-white/90 backdrop-blur-xl flex items-center justify-center border-4 border-accent-lime/5">
                {content}
            </div>
        );
    }

    return (
        <div className="w-full py-32 flex items-center justify-center">
            {content}
        </div>
    );
};

export default LoadingSpinner;
