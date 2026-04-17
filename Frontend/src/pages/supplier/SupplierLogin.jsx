import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE;

const SupplierLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate  = useNavigate();

    const handleChange  = (e) => setCredentials({ ...credentials, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(credentials.username, credentials.password);
            navigate('/supplier/orders');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    const inputClass = "w-full bg-[#0a0a0c] border border-white/10 text-white px-4 py-3.5 rounded-md text-sm outline-none transition-all focus:border-accent-lime focus:ring-2 focus:ring-accent-lime/10";

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#030303]"
             style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(182,255,93,0.05) 0%, transparent 60%)' }}>
            <div className="w-full max-w-[420px] bg-[#111] border border-white/5 rounded-xl p-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-accent-lime text-black px-5 py-2 rounded-md font-extrabold text-2xl mb-3"
                         style={{ fontFamily: "'Brush Script MT', cursive", letterSpacing: '1px' }}>
                        TEZA PARTNERS
                    </div>
                    <h1 className="text-xl font-black text-white mb-1">Supplier Portal</h1>
                    <p className="text-[13px] text-[#666]">Enter your credentials to manage fulfillments.</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-[#eb5757]/10 border border-[#eb5757]/20 text-[#eb5757] px-4 py-3 rounded-md text-[13px] text-center mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input type="text"     name="username" placeholder="Supplier Username"
                           value={credentials.username} onChange={handleChange} required className={inputClass} />
                    <input type="password" name="password" placeholder="Password"
                           value={credentials.password} onChange={handleChange} required className={inputClass} />
                    <button type="submit" className="lime-btn mt-2 w-full py-3.5 text-sm font-bold tracking-widest">
                        ACCESS PORTAL
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupplierLogin;
