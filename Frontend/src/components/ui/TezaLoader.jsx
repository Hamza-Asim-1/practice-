import React from 'react';
import { Hexagon } from 'lucide-react';

/**
 * TezaLoader: A high-end global loading screen.
 */
const TezaLoader = ({ visible = false, message = "Processing..." }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">
            {/* Blueprint Grid Overlay */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(rgba(182,255,93,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,93,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative flex flex-col items-center">
                {/* Pulsing Hexagon */}
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-accent-lime/20 rounded-full animate-ping opacity-20"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-white/5 border border-white/10 rounded-3xl transform rotate-45">
                        <Hexagon size={40} className="text-accent-lime animate-spin-slow -rotate-45" />
                    </div>
                </div>

                <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-white/50 animate-pulse">
                    {message}
                </h2>
                
                {/* Tech Deco */}
                <div className="mt-12 flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} 
                             className="w-1 h-8 bg-accent-lime/20 animate-pulse" 
                             style={{ animationDelay: `${i * 150}ms` }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TezaLoader;
