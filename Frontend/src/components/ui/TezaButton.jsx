import React from 'react';

/**
 * TezaButton: A premium, high-performance button component.
 * @param {boolean} loading - Displays a loading state.
 * @param {string} variant - 'primary' (lime) or 'secondary' (white).
 * @param {LucideIcon} icon - Optional icon to display.
 */
const TezaButton = ({ 
    children, 
    type = 'submit', 
    loading = false, 
    disabled = false, 
    onClick,
    icon: Icon,
    className = "",
    variant = 'primary'
}) => {
    const variants = {
        primary: "bg-accent-lime text-black",
        secondary: "bg-black text-white hover:bg-accent-lime hover:text-black",
        ghost: "bg-transparent border border-black/10 text-black hover:bg-black/5"
    };

    return (
        <button 
            type={type} 
            onClick={onClick}
            disabled={loading || disabled}
            className={`
                relative w-full overflow-hidden py-5 
                font-black text-[11px] uppercase tracking-[0.4em] 
                transition-all duration-500 flex items-center justify-center gap-3 
                hover:scale-[1.02] active:scale-[0.98] 
                disabled:opacity-50 disabled:cursor-not-allowed
                group
                ${variants[variant]}
                ${className}
            `}
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        >
            {/* Animated Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>

            {loading ? (
                <div className="flex items-center gap-3">
                    <span className="animate-pulse tracking-widest">PROCESSING...</span>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {children}
                    {Icon && <Icon size={16} className="transition-transform group-hover:scale-125" />}
                </>
            )}
        </button>
    );
};

export default TezaButton;
