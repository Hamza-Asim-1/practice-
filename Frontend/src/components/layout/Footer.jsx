import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/branding';

const Footer = () => {
    return (
        <footer className="relative pt-32 pb-12 bg-[#0A0A0B] overflow-visible" id="contact">


            {/* Midnight Marble Texture - Restored with low opacity to prevent "grey film" */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden z-0">
                <img 
                    src="/assets/images/footer-marble.png" 
                    alt="" 
                    className="w-full h-full object-cover scale-110"
                />
            </div>
            
            {/* Subtle Gradient Glows */}


            <div className="teza-container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="inline-block mb-8 group no-underline">
                            <span className="font-['Brush_Script_MT',cursive] text-6xl text-accent-lime drop-shadow-[0_2px_15px_rgba(186,205,56,0.3)] transition-transform group-hover:scale-105">
                                {BRAND.name}
                            </span>
                        </Link>
                        <p className="text-white! opacity-70 text-base font-medium leading-relaxed mb-10 max-w-sm">
                            The definitive source for British HMC-certified premium cuts. Artistic butchery delivered with precision.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-accent-lime group-hover:bg-accent-lime group-hover:text-black transition-all">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <span className="text-white! font-black tracking-widest text-sm">0811 111 111 111</span>
                            </div>
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-accent-lime group-hover:bg-accent-lime group-hover:text-black transition-all">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                </div>
                                <span className="text-white! opacity-60 font-medium text-xs leading-tight">Unit 12, Butcher's Row, London, EC1A 9PQ</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - Pure White for Visibility */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10">Navigation</h4>
                        <ul className="space-y-6">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'About', path: '/#about' },
                                { name: 'Collection', path: '/products' },
                                { name: 'Contact', path: '/#contact' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link 
                                        to={item.path}
                                        className="text-white! opacity-80 text-[11px] font-black uppercase tracking-widest transition-all hover:text-accent-lime hover:opacity-100 hover:translate-x-1 flex items-center gap-2 group no-underline"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-lime scale-0 group-hover:scale-100 transition-transform" />
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Socials - Pure White and High Contrast */}
                    <div className="lg:col-span-2">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10">Follow Us</h4>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { name: 'Facebook', icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path> },
                                { name: 'Instagram', icon: <g><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></g> },
                                { name: 'Twitter', icon: <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path> },
                                { name: 'TikTok', icon: <path d="M9 12a4 4 0 1 0 0 8a4 4 0 0 0 0-8zm0-9V2h5v3.13a6 6 0 0 0 4 5.37V15a10 10 0 1 1-10-10V3z"></path> }
                            ].map((social) => (
                                <a 
                                    key={social.name}
                                    href="#" 
                                    aria-label={social.name}
                                    className="w-14 h-14 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-white! transition-all hover:bg-accent-lime hover:border-accent-lime hover:text-black hover:-translate-y-2 group shadow-xl"
                                >
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        {social.icon}
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-4">
                        <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-10">Newsletter</h4>
                        <p className="text-white! opacity-70 text-sm font-medium mb-8 leading-relaxed">
                            Subscribe for exclusive farm access, seasonal drops, and master butchery tips.
                        </p>
                        <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                className="w-full bg-white/10 border border-white/30 rounded-2xl px-6 py-5 text-white text-sm outline-none transition-all duration-300 focus:border-accent-lime focus:bg-white/20 placeholder:text-white/40" 
                                type="email" 
                                placeholder="Email Address" 
                                required 
                            />
                            <button 
                                type="submit" 
                                className="absolute right-3 top-3 bottom-3 px-6 bg-accent-lime text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all hover:bg-white hover:scale-105"
                            >
                                JOIN
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-white! opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} {BRAND.name.toUpperCase()} LTD. ALL RIGHTS RESERVED
                    </div>
                    <div className="flex gap-10 text-white! opacity-30 text-[10px] font-black uppercase tracking-widest">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Refunds</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
