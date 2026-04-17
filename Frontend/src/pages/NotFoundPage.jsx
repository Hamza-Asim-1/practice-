import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-[#FCFCF9] text-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <img 
                    src="/assets/images/footer-marble.png" 
                    alt="" 
                    className="w-full h-full object-cover grayscale brightness-125"
                />
            </div>

            <div className="relative z-10 text-center max-w-[500px] animate-in fade-in zoom-in-95 duration-700">
                {/* Large 404 Visual */}
                <div className="relative inline-block mb-12">
                    {/* Simplified 404 visual for a cleaner look */}
                    <h1 className="text-[120px] sm:text-[180px] font-extrabold leading-none tracking-tighter text-gray-200 select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-100/50 blur-3xl animate-pulse rounded-full" />
                            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100">
                                <FileQuestion size={40} sm:size={48} className="text-blue-500" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-12">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-px bg-black/10" />
                        <span className="text-black/30 text-[10px] font-black uppercase tracking-[0.4em]">Lost in Destination</span>
                        <div className="w-12 h-px bg-black/10" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">Page Not Found</h2>
                    <p className="text-black/50 text-sm leading-relaxed max-w-[340px] mx-auto font-medium">
                        The page you are looking for doesn't exist or has been moved. Let's get you back on track.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-black/5 border border-black/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-black/60 hover:text-black hover:bg-black/10 transition-all group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                        Go Back
                    </button>
                    <Link 
                        to="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-accent-lime text-black rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-accent-lime/20 hover:bg-white hover:scale-105 transition-all no-underline"
                    >
                        <Home size={14} /> 
                        Home Dashboard
                    </Link>
                </div>

                {/* Detail */}
                <div className="mt-16 pt-8 border-t border-black/5">
                    <span className="text-[9px] font-bold text-black/20 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                        <span className="w-1.5 h-1.5 bg-accent-lime rounded-full animate-pulse" />
                        System Status: Operational
                    </span>
                </div>
            </div>

            {/* Aesthetic Glows */}
            <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-accent-lime/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-accent-lime/10 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};

export default NotFoundPage;
