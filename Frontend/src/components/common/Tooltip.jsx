import React from 'react';

const Tooltip = ({ text, children, position = 'top' }) => {
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowPositionClasses = {
        top: '-bottom-1 left-1/2 -translate-x-1/2 border-r border-b',
        bottom: '-top-1 left-1/2 -translate-x-1/2 border-l border-t',
        left: '-right-1 top-1/2 -translate-y-1/2 border-t border-r',
        right: '-left-1 top-1/2 -translate-y-1/2 border-b border-l',
    };

    return (
        <div className="group relative inline-flex items-center justify-center">
            {children}
            <div className={`
                absolute z-[100] invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100
                px-3 py-2 rounded-xl bg-[#0A0A0A] text-white text-[9px] font-black uppercase tracking-widest whitespace-nowrap
                border border-white/10 shadow-2xl shadow-black backdrop-blur-md pointer-events-none
                ${positionClasses[position]}
            `}>
                {text}
                <div className={`
                    absolute w-1.5 h-1.5 bg-[#0A0A0A] rotate-45 border-white/10 
                    ${arrowPositionClasses[position]}
                `}></div>
            </div>
        </div>
    );
};

export default Tooltip;
