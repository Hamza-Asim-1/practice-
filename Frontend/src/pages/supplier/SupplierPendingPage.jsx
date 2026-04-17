import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, Clock, ChevronRight, UserCheck } from 'lucide-react';
import { BRAND } from '../../config/branding';

const SupplierPendingPage = () => {
    return (
        <div className="min-h-screen bg-[#FCFCF9] flex flex-col items-center justify-center p-6 text-black text-center relative overflow-hidden">
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <img 
                    src="/assets/images/footer-marble.png" 
                    alt="" 
                    className="w-full h-full object-cover grayscale brightness-125"
                />
            </div>

            {/* Aesthetic Glows */}
            <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-accent-lime/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-accent-lime/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-[650px] animate-in fade-in zoom-in-95 duration-700">
                <div className="mb-10 relative">
                    <div className="w-28 h-28 rounded-3xl bg-white shadow-2xl flex items-center justify-center border border-black/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="w-20 h-20 rounded-2xl bg-accent-lime/10 flex items-center justify-center border border-accent-lime/20">
                            <Clock size={44} className="text-accent-lime animate-pulse" />
                        </div>
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-accent-lime rounded-full border-4 border-[#FCFCF9] flex items-center justify-center shadow-lg">
                        <ShieldAlert size={18} className="text-black" />
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-px bg-black/10" />
                        <span className="text-black/30 text-[10px] font-black uppercase tracking-[0.4em]">Account Status</span>
                        <div className="w-12 h-px bg-black/10" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
                        Application <span className="text-accent-lime italic">Under Review</span>
                    </h1>
                </div>
                
                <p className="max-w-[480px] text-black/50 text-sm md:text-base leading-relaxed mb-12 font-medium">
                    Thank you for applying to be a partner with {BRAND.name}. Our team is manually verifying your credentials to maintain our premium standards.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                    <div className="group p-8 rounded-[32px] bg-white border border-black/5 flex flex-col items-center shadow-xl shadow-black/5 hover:shadow-accent-lime/10 hover:border-accent-lime/20 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-accent-lime/10 transition-colors mb-4">
                            <Mail className="text-black/30 group-hover:text-accent-lime transition-colors" size={24} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-black/80">Check Email</h3>
                        <p className="text-[11px] text-black/30 leading-relaxed max-w-[180px]">We'll send your approval notice to your registered email address.</p>
                    </div>
                    <div className="group p-8 rounded-[32px] bg-white border border-black/5 flex flex-col items-center shadow-xl shadow-black/5 hover:shadow-accent-lime/10 hover:border-accent-lime/20 transition-all duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center group-hover:bg-accent-lime/10 transition-colors mb-4">
                            <UserCheck className="text-black/30 group-hover:text-accent-lime transition-colors" size={24} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest mb-2 text-black/80">Support Status</h3>
                        <p className="text-[11px] text-black/30 leading-relaxed max-w-[180px]">Verification typically takes 24-48 business hours to complete.</p>
                    </div>
                </div>

                <Link to="/" className="text-[11px] font-black tracking-[4px] uppercase text-black/30 hover:text-accent-lime transition-all flex items-center gap-2 group">
                    <span className="w-8 h-px bg-black/10 group-hover:bg-accent-lime/20" />
                    RETURN TO HOME 
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
};

export default SupplierPendingPage;
