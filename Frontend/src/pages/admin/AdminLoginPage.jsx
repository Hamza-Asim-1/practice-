import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { UI_TEXT } from '../../config/ui-text';
import { loginSchema } from '../../schemas/auth.schema';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const { login, logout } = useAuth();
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Zod Validation
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        setLoadingAction(true);
        try {
            const result = await login(email, password);

            if (result.success) {
                if (result.user?.role === 'SUPER_ADMIN' || result.user?.role === 'OPS_ADMIN') {
                    navigate('/admin');
                } else {
                    if (logout) await logout();
                    setErrorMsg(UI_TEXT.error.accessDenied);
                }
            } else {
                setErrorMsg(result.message || UI_TEXT.error.generic);
            }
        } catch (err) {
            setErrorMsg(UI_TEXT.error.serverDown);
        } finally {
            setLoadingAction(false);
        }
    };

    const inputClass = "w-full bg-black/5 border border-black/5 text-text-cream px-4 py-3.5 rounded-lg text-sm outline-none transition-all focus:border-accent-lime focus:ring-2 focus:ring-accent-lime/10 font-bold";

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white/80"
             style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(182,255,93,0.1), transparent 400px)' }}>
            <div className="w-full max-w-[440px] bg-white border border-black/5 rounded-[32px] p-10 shadow-xl">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="font-['Brush_Script_MT',cursive] text-accent-lime text-5xl mb-2"
                        style={{ textShadow: '0 0 20px rgba(182,255,93,0.2)' }}>
                        TEZA
                    </h2>
                    <span className="text-[10px] font-black bg-black/5 px-3 py-1.5 rounded-lg tracking-widest text-black/40 uppercase">
                        SYSTEM SECURE LOGIN
                    </span>
                </div>

                {/* Error */}
                {errorMsg && (
                    <div className="bg-[#eb5757]/10 border border-[#eb5757]/20 text-[#eb5757] px-4 py-3 rounded-xl text-[13px] text-center mb-6 font-bold">
                        {errorMsg}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-black/40 uppercase tracking-widest font-black">Administrator Email</label>
                        <input type="email" required placeholder="admin@teza.com" value={email}
                               onChange={e => setEmail(e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-black/40 uppercase tracking-widest font-black">Master Password</label>
                        <input type="password" required placeholder="••••••••" value={password}
                               onChange={e => setPassword(e.target.value)} className={inputClass} />
                    </div>
                    <button type="submit" className="bg-accent-lime text-black rounded-lg mt-3 w-full py-4 text-[14px] font-bold tracking-widest flex items-center justify-center gap-2">
                        {loadingAction ? 'AUTHENTICATING...' : 'Login'}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-10 text-center border-t border-black/5 pt-8">
                    <p className="text-[11px] text-black/30 mb-4 leading-relaxed font-bold">
                        Protected System Area. Unauthorized access is strictly prohibited and logged.
                    </p>
                    <a href="/" className="text-black/40 text-[13px] hover:text-text-cream transition-colors no-underline font-black flex items-center justify-center gap-2">
                        <span className="w-4 h-px bg-black/10"></span>
                        Return to Public Homepage
                        <span className="w-4 h-px bg-black/10"></span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
