import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { BRAND } from '../../config/branding';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();
    const { items, toggleCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed left-1/2 -translate-x-1/2 z-1000 transition-all duration-500 ease-in-out w-[95%] lg:w-[90%] max-w-7xl px-12 rounded-3xl border top-4 bg-white/95 backdrop-blur-xl py-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-black/3">
            {/* Left Fork Decoration */}
            <div 
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full h-[70%] w-10 transition-all duration-500 bg-accent-lime shadow-[-5px_0_15px_rgba(186,205,56,0.3)]`}
                style={{ clipPath: 'polygon(0% 0%, 100% 20%, 100% 80%, 0% 100%, 40% 50%)' }}
            />
            
            <div className="w-full flex items-center justify-between transition-all duration-500">
                {/* Logo - Left */}
                <Link to="/" className="flex items-center gap-2 group shrink-0 no-underline">
                    <span className="font-['Brush_Script_MT',cursive] text-4xl text-accent-lime drop-shadow-sm transition-transform group-hover:scale-105">
                        {BRAND.name}
                    </span>
                </Link>

                {/* Desktop Menu - Centered */}
                <div className="hidden lg:flex grow justify-center">
                    <ul className="flex items-center gap-10">
                        {[
                            { label: 'HOME', path: '/' },
                            { label: 'ABOUT', path: '/#about' },
                            { label: 'PRODUCT', path: '/products' },
                            { label: 'CONTACT', path: '/#contact' },
                        ].map((link) => (
                            <li key={link.label}>
                                {link.path.startsWith('/') && !link.path.includes('#') ? (
                                    <Link 
                                        to={link.path} 
                                        className={`text-[11px] font-black tracking-widest transition-all hover:text-accent-lime relative py-2 ${
                                            isActive(link.path) ? 'text-black after:w-full' : 'text-black/40 after:w-0'
                                        } after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-accent-lime after:transition-all after:duration-500`}
                                    >
                                        {link.label}
                                    </Link>
                                ) : (
                                    <a 
                                        href={link.path} 
                                        className="text-[11px] font-black tracking-widest transition-all hover:text-accent-lime relative py-2 text-black/40 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent-lime after:transition-all after:duration-500 hover:after:w-full"
                                    >
                                        {link.label}
                                    </a>
                                )}
                            </li>
                        ))}
                        {user?.role === 'SUPPLIER_ADMIN' && (
                            <li>
                                <Link 
                                    to="/supplier/dashboard" 
                                    className="text-[11px] font-black tracking-widest transition-all hover:text-accent-lime relative py-2 text-black/40 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-accent-lime after:transition-all after:duration-500"
                                >
                                    SUPPLIER PORTAL
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* Actions - Right */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Cart */}
                    <button 
                        className="relative transition-all p-2 rounded-xl bg-white/5 hover:bg-white/10 text-black/40 hover:text-accent-lime"
                        onClick={toggleCart} 
                        aria-label="Cart"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        {items.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-accent-lime text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
                                {items.length}
                            </span>
                        )}
                    </button>

                    {/* Login/Account Icon */}
                    <Link 
                        to={user ? (user.role?.includes('ADMIN') ? "/admin" : "/account") : "/login"} 
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-xl bg-accent-lime text-black hover:bg-black hover:text-white!"
                        aria-label="Account"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div className="hidden sm:flex flex-col items-start">
                            {user ? (
                                <>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-0.5">
                                        {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username || user.email?.split('@')[0] || 'Member'}
                                    </span>
                                    <span className="text-[9px] font-bold text-black/30 uppercase tracking-widest">
                                        {user.role?.replace('_', ' ') || 'User'} Profile
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Login</span>
                                </>
                            )}
                        </div>
                    </Link>
                </div>
            </div>

            {/* Right Fork Decoration */}
            <div 
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-full h-[70%] w-10 transition-all duration-500 bg-accent-lime shadow-[5px_0_15px_rgba(186,205,56,0.3)]`}
                style={{ clipPath: 'polygon(100% 0%, 0% 20%, 0% 80%, 100% 100%, 60% 50%)' }}
            />
        </nav>
    );
};

export default Navbar;
