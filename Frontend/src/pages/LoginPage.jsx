import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema } from '../schemas/auth.schema';
import { Helmet } from 'react-helmet-async';
import { BRAND } from '../config/branding';
import gsap from 'gsap';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const containerRef = useRef(null);
    const formCardRef = useRef(null);
    const hookBackRef = useRef(null);
    const hookFrontRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial Entrance
            gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1 });
            
            // Collect all hanging elements for synchronized animation
            const hangingRefs = [formCardRef.current, hookBackRef.current, hookFrontRef.current];
            
            // The Hanging Swing Animation
            gsap.fromTo(hangingRefs, 
                { rotate: -2, transformOrigin: "top center", y: -20, opacity: 0 },
                { 
                    rotate: 0, 
                    y: 0, 
                    opacity: 1, 
                    duration: 2.5, 
                    ease: "elastic.out(1, 0.4)",
                    delay: 0.5,
                    stagger: 0
                }
            );

            // Subtle persistent swing
            gsap.to(hangingRefs, {
                rotate: 0.5,
                transformOrigin: "top center",
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
        return () => ctx.revert();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (globalError) setGlobalError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGlobalError('');
        
        const validation = loginSchema.safeParse(form);
        if (!validation.success) {
            const fieldErrors = {};
            validation.error.issues.forEach(issue => {
                fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            const result = await login(form.email, form.password);
            if (result.success) {
                gsap.to([formCardRef.current, hookBackRef.current, hookFrontRef.current], { 
                    y: 100, 
                    opacity: 0, 
                    duration: 0.8, 
                    ease: "power4.in", 
                    onComplete: () => navigate('/') 
                });
            } else {
                setGlobalError(result.message || 'Access Denied. Check credentials.');
            }
        } catch (err) {
            setGlobalError('Registry Server Offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section ref={containerRef} className="min-h-screen bg-white flex flex-col md:flex-row relative overflow-hidden">
            {/* Page-wide Marble Background (20% Opacity) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply transition-opacity duration-1000">
                <img src="/assets/images/footer-marble.png" alt="" className="w-full h-full object-cover scale-150 rotate-180" />
            </div>
            
            {/* Left Side: The Cleaver's Void (Atmospheric) */}
            <div className="hidden lg:flex w-1/3 flex-col justify-center p-20 relative z-10 bg-radial-gradient(at 0% 0%, #FFFFFF 0%, #F5F5F5 100%)">
                <div className="absolute inset-0 opacity-0 pointer-events-none grayscale contrast-150">
                    <img src="/assets/images/footer-marble.png" alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="relative">
                    <Link to="/" className="inline-block mb-12 group">
                        <span className="font-['Brush_Script_MT',cursive] text-6xl bg-black p-4 rounded-md text-accent-lime drop-shadow-2xl transition-transform group-hover:scale-110 block">Teza</span>
                        <div className="h-0.5 w-full bg-accent-lime/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </Link>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-black/60 mb-6 italic leading-relaxed">
                        Established 1984 • Premium Selection
                    </h2>
                    <h3 className="text-4xl xl:text-5xl font-black text-black leading-tight tracking-tighter">
                        THE ART OF THE<br/><span className="text-black bg-accent-lime italic">PERFECT CUT</span>
                    </h3>
                </div>
            </div>

            {/* Main Area: The Hanging Unit (Hook + Card) */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-32 pb-48">
                
                {/* Unified Hanging Container */}
                <div className="relative w-full max-w-[540px] flex flex-col items-center">
                    
                    {/* The Back Part of the Hook (Behind Card - Vertical Shaft) */}
                    <div ref={hookBackRef} className="absolute -top-[290px] left-1/2 -translate-x-1/2 w-64 h-[400px] opacity-95 pointer-events-none z-0">
                        <svg viewBox="0 0 200 400" className="w-full h-full text-accent-lime fill-current">
                            {/* Vertical shaft coming from top, ending exactly at y=300 (which corresponds to +10px on card) */}
                            <path d="M100 0 L100 300" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="100" cy="10" r="4" fill="currentColor" />
                        </svg>
                    </div>                    {/* The Black Marble Card */}
                    <div 
                        ref={formCardRef} 
                        className="relative w-full bg-black shadow-[20px_40px_100px_rgba(0,0,0,0.8)] p-12 md:p-20 z-10"
                        style={{ 
                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 98%, 85% 100%, 50% 97%, 15% 100%, 0% 98%)' 
                        }}
                    >
                        {/* Realistic Pierce Hole (Positioned exactly at 10px down) */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-10 h-3 bg-white/20 blur-[1px] rounded-full z-20 pointer-events-none shadow-inner" 
                             style={{ top: '8px' }} />
                        
                        {/* Dark torn paper highlight */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-12 h-2 bg-black/40 blur-[2px] rounded-full z-20 pointer-events-none" 
                             style={{ top: '9px' }} />
                        
                        {/* Black Marble Texture Effect */}
                        <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen invert hue-rotate-180">
                            <img src="/assets/images/footer-marble.png" alt="" className="w-full h-full object-cover scale-150" />
                        </div>

                        <div className="relative z-10">
                            <header className="text-center mb-16">
                                <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
                                    <span className="w-12 h-px bg-accent-lime/30" />
                                    <Shield size={16} className="text-accent-lime" />
                                    <span className="w-12 h-px bg-accent-lime/30" />
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
                                    LOGIN TO<br/><span className="text-accent-lime italic">ACCOUNT</span>
                                </h1>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Access Your Teza Profile</p>
                            </header>

                            {/* Error Block - Stamp Aesthetic */}
                            {globalError && (
                                <div className="mb-12 border-2 border-red-500/50 p-6 rounded-sm relative overflow-hidden group bg-red-500/5">
                                    <div className="absolute -right-4 -top-4 opacity-[0.1] group-hover:rotate-12 transition-transform">
                                        <AlertCircle size={80} className="text-red-500" />
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                        <p className="text-red-500 text-[11px] font-black uppercase tracking-widest">{globalError || "Login failed. Please try again."}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Inputs - Premium Dark Style */}
                                <div className="space-y-8">
                                    <div className="form-group relative">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Email Address</label>
                                        <div className="relative group/field">
                                            <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime transition-colors" />
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="your@email.com"
                                                className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 rounded-none px-16 py-6 text-white font-bold outline-none transition-all placeholder:text-white/10"
                                            />
                                            {errors.email && <span className="absolute -bottom-6 left-6 text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.email}</span>}
                                        </div>
                                    </div>

                                    <div className="form-group relative">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Password</label>
                                        <div className="relative group/field">
                                            <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime transition-colors" />
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                name="password"
                                                value={form.password}
                                                onChange={handleChange}
                                                placeholder="••••••••••••"
                                                className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 rounded-none px-16 py-6 text-white font-bold outline-none transition-all placeholder:text-white/10"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-accent-lime transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            {errors.password && <span className="absolute -bottom-6 left-6 text-[9px] font-black text-red-500 uppercase tracking-widest">{errors.password}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end pt-4 px-2">
                                    <Link to="/forgot-password" title="Reset Password" className="text-[10px] font-black text-accent-lime uppercase tracking-widest hover:brightness-125 transition-all">Forgot Password?</Link>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-accent-lime text-black h-[84px] font-black uppercase tracking-[0.4em] relative overflow-hidden group/btn shadow-2xl transition-all hover:shadow-[0_40px_80px_rgba(186,205,56,0.3)] hover:-translate-y-2 active:scale-[0.98] disabled:opacity-50"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-4 text-xs">
                                        {loading ? 'Logging in...' : 'Sign In'} 
                                        {!loading && <ArrowRight size={20} className="text-black group-hover/btn:translate-x-2 transition-transform" />}
                                    </span>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                                </button>
                            </form>

                            <div className="mt-16 text-center border-t border-white/5 pt-12">
                                <Link to="/register" className="group/link flex flex-col items-center gap-3 no-underline">
                                    <span className="text-[9px] font-black text-accent-lime uppercase tracking-[0.6em]">New to Teza?</span>
                                    <div className="flex items-center gap-4">
                                        <span className="w-6 h-px bg-white/10 group-hover/link:w-16 transition-all" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] group-hover/link:text-accent-lime transition-all">Create Account</span>
                                        <span className="w-6 h-px bg-white/10 group-hover/link:w-16 transition-all" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Aesthetic Dark Corner Stamp */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 border-4 border-white/5 rounded-full rotate-12 flex items-center justify-center pointer-events-none">
                           <span className="text-[8px] font-black text-white/5 uppercase tracking-widest text-center">CERTIFIED TEZA ARTISAN</span>
                        </div>
                    </div>

                    {/* The Front Part of the Hook (In Front of Card - Sharp Curve) */}
                    <div ref={hookFrontRef} className="absolute -top-[290px] left-1/2 -translate-x-1/2 w-64 h-[400px] opacity-95 pointer-events-none z-20">
                        <svg viewBox="0 0 200 400" className="w-full h-full text-accent-lime fill-current">
                            {/* The curved hook that pierces out from the hole at y=300 */}
                            <path d="M100 300 Q100 350 140 350 Q180 350 180 300" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;
