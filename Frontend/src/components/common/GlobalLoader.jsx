import React, { useEffect } from 'react';
import { BRAND } from '../../config/branding';

const GlobalLoader = () => {
    useEffect(() => {
        console.log("TEZA Global Loader Mounted");
    }, []);

    return (
        <div className="fixed inset-0 z-9999 bg-[#FCFCF9] flex flex-col items-center justify-center overflow-hidden border-8 border-accent-lime/10">
            {/* Soft Marble / Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none scale-105 animate-pulse-slow">
                <img 
                    src="/assets/images/footer-marble.png" 
                    alt="" 
                    className="w-full h-full object-cover grayscale brightness-125"
                    onError={(e) => console.log("Texture failed to load")}
                />
            </div>

            {/* Radiant Sun Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-accent-lime/10 blur-[180px] rounded-full animate-pulse opacity-60" />

            <div className="relative z-10 flex flex-col items-center px-6 text-center">
                {/* Brand Logo Reveal - Light Theme */}
                <div className="mb-14 relative group scale-90 sm:scale-100">
                    <span className="font-['Brush_Script_MT',cursive] text-[clamp(4.5rem,15vw,9rem)] text-black leading-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.05)] block animate-reveal-blur">
                        {BRAND.name}
                    </span>
                    {/* Accent Layer */}
                    <span className="absolute inset-x-0 -bottom-1 font-['Brush_Script_MT',cursive] text-[clamp(4.5rem,15vw,9rem)] text-accent-lime/20 leading-none select-none pointer-events-none blur-sm -z-10 translate-y-1">
                        {BRAND.name}
                    </span>
                </div>

                {/* Minimalist Loading Bar */}
                <div className="flex flex-col items-center gap-8 w-full max-w-[240px]">
                    <div className="w-full h-[2px] bg-black/5 relative overflow-hidden rounded-full">
                        <div className="absolute inset-y-0 left-0 bg-accent-lime animate-loader-slide rounded-full shadow-[0_0_15px_rgba(186,205,56,0.6)]" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-6">
                            <span className="w-8 h-px bg-black/10" />
                            <span className="text-[11px] font-black uppercase tracking-[0.6em] text-black/30 whitespace-nowrap">
                                Premium Butchery
                            </span>
                            <span className="w-8 h-px bg-black/10" />
                        </div>
                        
                        {/* Dot Progression */}
                        <div className="flex items-center gap-2.5 h-1.5 mt-2">
                            {[0, 1, 2].map((i) => (
                                <div 
                                    key={i}
                                    className="w-1.5 h-1.5 bg-accent-lime rounded-full animate-bounce shadow-sm" 
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes reveal-blur {
                    0% { filter: blur(40px); opacity: 0; transform: scale(0.9) translateY(20px); }
                    100% { filter: blur(0); opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes loader-slide {
                    0% { left: -40%; width: 40%; }
                    50% { left: 20%; width: 70%; }
                    100% { left: 100%; width: 40%; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.02; transform: scale(1); }
                    50% { opacity: 0.05; transform: scale(1.05); }
                }
                .animate-reveal-blur {
                    animation: reveal-blur 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-loader-slide {
                    animation: loader-slide 3s infinite cubic-bezier(0.65, 0, 0.35, 1);
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
                body {
                    overflow: hidden !important;
                }
            `}} />
        </div>
    );
};

export default GlobalLoader;
