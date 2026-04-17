import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Phone, Briefcase, Shield, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../schemas/auth.schema';
import { Helmet } from 'react-helmet-async';
import { BRAND } from '../config/branding';
import gsap from 'gsap';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ 
        role: 'CUSTOMER',
        email: '', 
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        businessName: '',
        hmcCertNumber: '',
        address: '', 
        addressLine1: '',
        addressLine2: '',
        city: '',
        area: '',
        postcode: '',
    });
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
        
        const validation = registerSchema.safeParse(form);
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
            const result = await register(form);
            if (result.success) {
                gsap.to([formCardRef.current, hookBackRef.current, hookFrontRef.current], { 
                    y: 100, 
                    opacity: 0, 
                    duration: 0.8, 
                    ease: "power4.in", 
                    onComplete: () => {
                        if (form.role === 'SUPPLIER_ADMIN') {
                            navigate('/supplier/pending');
                        } else {
                            navigate('/');
                        }
                    }
                });
            } else {
                setGlobalError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setGlobalError('Registry Server Offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section ref={containerRef} className="min-h-screen bg-bg-dark flex flex-col md:flex-row relative overflow-hidden">
            <Helmet>
                <title>Register | {BRAND.name} Membership</title>
                <meta name="description" content="Join the Teza family today. Create an account to access premium butchery selections, specialized cuts, and convenient delivery." />
            </Helmet>
            {/* Page-wide Marble Background (20% Opacity) - Global Background is inherited from index.css but keeping specific overlays if needed */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply transition-opacity duration-1000">
                <img src="/assets/images/footer-marble.png" alt="" className="w-full h-full object-cover scale-150 rotate-180" />
            </div>
            
            {/* Left Side: Branding (Atmospheric) */}
            <div className="hidden lg:flex w-1/3 flex-col justify-center p-20 relative z-10 bg-radial-gradient(at 0% 0%, #FFFFFF 0%, #F5F5F5 100%)">
                <div className="relative">
                    <Link to="/" className="inline-block mb-12 group">
                        <span className="font-['Brush_Script_MT',cursive] text-6xl bg-black p-4 rounded-md text-accent-lime drop-shadow-2xl transition-transform group-hover:scale-110 block">Teza</span>
                    </Link>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-black/60 mb-6 italic leading-relaxed">
                        Join Our Legacy • Established 1984
                    </h2>
                    <h3 className="text-4xl xl:text-5xl font-black text-black leading-tight tracking-tighter">
                        BECOME A PART OF THE<br/><span className="text-black bg-accent-lime italic">ELITE CIRCLE</span>
                    </h3>
                </div>
            </div>

            {/* Main Area: The Hanging Unit (Hook + Card) */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-32 pb-48">
                
                {/* Unified Hanging Container */}
                <div className="relative w-full max-w-[640px] flex flex-col items-center">
                    
                    {/* The Back Part of the Hook */}
                    <div ref={hookBackRef} className="absolute -top-[290px] left-1/2 -translate-x-1/2 w-64 h-[400px] opacity-95 pointer-events-none z-0">
                        <svg viewBox="0 0 200 400" className="w-full h-full text-accent-lime fill-current">
                            <path d="M100 0 L100 300" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                            <circle cx="100" cy="10" r="4" fill="currentColor" />
                        </svg>
                    </div>

                    {/* The Black Marble Card */}
                    <div 
                        ref={formCardRef} 
                        className="relative w-full bg-black shadow-[20px_40px_100px_rgba(0,0,0,0.8)] p-10 md:p-16 z-10"
                        style={{ 
                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 99%, 85% 100%, 50% 98%, 15% 100%, 0% 99%)' 
                        }}
                    >
                        {/* Pierce Hole */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-10 h-3 bg-white/20 blur-[1px] rounded-full z-20 pointer-events-none shadow-inner" 
                             style={{ top: '8px' }} />
                        
                        {/* Black Marble Texture */}
                        <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen invert hue-rotate-180">
                            <img src="/assets/images/footer-marble.png" alt="" className="w-full h-full object-cover scale-150" />
                        </div>

                        <div className="relative z-10">
                            <header className="text-center mb-12">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3">
                                    CREATE<br/><span className="text-accent-lime italic">ACCOUNT</span>
                                </h1>
                                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Secure Registration Portal</p>
                            </header>

                            {/* Global Error */}
                            {globalError && (
                                <div className="mb-8 border-2 border-red-500/50 p-4 bg-red-500/5 flex items-center gap-3">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{globalError}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Role Selection */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-4 opacity-40">
                                        <span className="h-px bg-accent-lime grow" />
                                        <h2 className="text-[10px] font-black text-white whitespace-nowrap">Select Your Account Type:</h2>
                                        <span className="h-px bg-accent-lime grow" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setForm({ ...form, role: 'CUSTOMER' })}
                                            className={`py-4 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border ${form.role === 'CUSTOMER' ? 'bg-accent-lime text-black border-accent-lime' : 'bg-white/5 text-white/20 border-accent-lime/20 hover:bg-white/10 hover:border-accent-lime/40 hover:text-white/60'}`}
                                            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                                        >
                                            <User size={16} className={form.role === 'CUSTOMER' ? 'text-black' : 'text-white/10'} />
                                            Customer
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setForm({ ...form, role: 'SUPPLIER_ADMIN' })}
                                            className={`py-4 text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 border ${form.role === 'SUPPLIER_ADMIN' ? 'bg-accent-lime text-black border-accent-lime shadow-[0_0_30px_rgba(186,205,56,0.2)]' : 'bg-white/5 text-white/20 border-accent-lime/20 hover:bg-white/10 hover:border-accent-lime/40 hover:text-white/60'}`}
                                            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                                        >
                                            <Briefcase size={16} className={form.role === 'SUPPLIER_ADMIN' ? 'text-black' : 'text-white/10'} />
                                            Butcher
                                        </button>
                                    </div>
                                </div>

                                {/* Identity Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group relative">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">First Name</label>
                                        <div className="relative group/field">
                                            <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                            <input 
                                                type="text" 
                                                name="firstName"
                                                value={form.firstName}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                placeholder="John"
                                            />
                                            {errors.firstName && <span className="absolute -bottom-5 left-6 text-[8px] font-black text-red-500 uppercase">{errors.firstName}</span>}
                                        </div>
                                    </div>
                                    <div className="form-group relative">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Last Name</label>
                                        <div className="relative group/field">
                                            <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                            <input 
                                                type="text" 
                                                name="lastName"
                                                value={form.lastName}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                placeholder="Doe"
                                            />
                                            {errors.lastName && <span className="absolute -bottom-5 left-6 text-[8px] font-black text-red-500 uppercase">{errors.lastName}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group relative">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Email</label>
                                        <div className="relative group/field">
                                            <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                placeholder="email@example.com"
                                            />
                                            {errors.email && <span className="absolute -bottom-5 left-6 text-[8px] font-black text-red-500 uppercase">{errors.email}</span>}
                                        </div>
                                    </div>
                                    <div className="form-group relative">
                                        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Phone</label>
                                        <div className="relative group/field">
                                            <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                            <input 
                                                type="text" 
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                placeholder="07xxx xxxxxx"
                                            />
                                            {errors.phone && <span className="absolute -bottom-5 left-6 text-[8px] font-black text-red-500 uppercase">{errors.phone}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Supplier Specifics */}
                                {form.role === 'SUPPLIER_ADMIN' && (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-3 mb-2 opacity-40">
                                            <span className="h-px bg-accent-lime grow" />
                                            <h2 className="text-[10px] font-black text-white whitespace-nowrap uppercase tracking-widest">Business Information</h2>
                                            <span className="h-px bg-accent-lime grow" />
                                        </div>
                                        
                                        <div className="form-group relative">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Butchery / Store Name</label>
                                            <div className="relative group/field">
                                                <Briefcase size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                                <input 
                                                    type="text" 
                                                    name="businessName"
                                                    value={form.businessName}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                    placeholder="Artisan Halal Cuts"
                                                    required={form.role === 'SUPPLIER_ADMIN'}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group relative">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">HMC Certificate Number (Optional)</label>
                                            <div className="relative group/field">
                                                <ShieldCheck size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                                <input 
                                                    type="text" 
                                                    name="hmcCertNumber"
                                                    value={form.hmcCertNumber}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                    placeholder="HMC-12345"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group relative">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Address Line 1 *</label>
                                                <div className="relative group/field">
                                                    <input 
                                                        type="text" 
                                                        name="addressLine1"
                                                        value={form.addressLine1}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-6 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                        placeholder="123 Butcher Lane"
                                                        required={form.role === 'SUPPLIER_ADMIN'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group relative">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Address Line 2</label>
                                                <div className="relative group/field">
                                                    <input 
                                                        type="text" 
                                                        name="addressLine2"
                                                        value={form.addressLine2}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-6 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                        placeholder="Suite 4"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="form-group relative">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">City *</label>
                                                <div className="relative group/field">
                                                    <input 
                                                        type="text" 
                                                        name="city"
                                                        value={form.city}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-6 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                        placeholder="London"
                                                        required={form.role === 'SUPPLIER_ADMIN'}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group relative">
                                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Area / Region *</label>
                                                <div className="relative group/field">
                                                    <input 
                                                        type="text" 
                                                        name="area"
                                                        value={form.area}
                                                        onChange={handleChange}
                                                        className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-6 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                        placeholder="Central"
                                                        required={form.role === 'SUPPLIER_ADMIN'}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group relative">
                                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Postcode *</label>
                                            <div className="relative group/field">
                                                <input 
                                                    type="text" 
                                                    name="postcode"
                                                    value={form.postcode}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-6 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                                    placeholder="E1 6AN"
                                                    required={form.role === 'SUPPLIER_ADMIN'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Security */}
                                <div className="form-group relative">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 absolute -top-3 left-6 bg-black px-3 z-10">Password</label>
                                    <div className="relative group/field">
                                        <Lock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/field:text-accent-lime" />
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            name="password"
                                            value={form.password}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border-2 border-white/10 focus:border-accent-lime/40 px-14 py-4 text-white text-sm font-bold outline-none transition-all placeholder:text-white/5"
                                            placeholder="••••••••••••"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-accent-lime"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        {errors.password && <span className="absolute -bottom-5 left-6 text-[8px] font-black text-red-500 uppercase">{errors.password}</span>}
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-accent-lime text-black h-[72px] font-black uppercase tracking-[0.4em] relative overflow-hidden group/btn shadow-2xl transition-all hover:-translate-y-1 disabled:opacity-50"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 text-[11px]">
                                        {loading ? 'Processing...' : 'Complete Registry'} 
                                        {!loading && <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />}
                                    </span>
                                </button>
                            </form>

                            <div className="mt-10 text-center border-t border-white/5 pt-8">
                                <Link to="/login" className="group/link flex flex-col items-center gap-2 no-underline">
                                    <span className="text-[8px] font-black text-accent-lime uppercase tracking-[0.5em]">Already a member?</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] group-hover/link:text-accent-lime transition-all">Sign In Instead</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* The Front Part of the Hook */}
                    <div ref={hookFrontRef} className="absolute -top-[290px] left-1/2 -translate-x-1/2 w-64 h-[400px] opacity-95 pointer-events-none z-20">
                        <svg viewBox="0 0 200 400" className="w-full h-full text-accent-lime fill-current">
                            <path d="M100 300 Q100 350 140 350 Q180 350 180 300" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RegisterPage;
