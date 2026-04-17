import React from 'react';

const Contact = () => {
    return (
        <section id="contact" className="py-32 bg-[#FFFFFF] relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/natural-paper.png')" }} />
            
            <div className="teza-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-24">
                    {/* Contact Info */}
                    <div>
                        <span className="text-accent-lime font-black text-xs uppercase tracking-[0.4em] mb-6 block">Get in Touch</span>
                        <h2 className="text-5xl md:text-6xl font-black text-[#1C1D1D] uppercase leading-[0.9] mb-12 tracking-tighter">
                            Let's Talk <br />
                            <span className="text-accent-lime">Freshness</span>
                        </h2>
                        
                        <div className="space-y-12">
                            <div className="flex gap-8 group">
                                <div className="w-16 h-16 bg-[#F8F9FA] rounded-3xl flex items-center justify-center text-accent-lime transition-colors group-hover:bg-accent-lime group-hover:text-white shadow-sm border border-black/5">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1C1D1D]/30 mb-2">Call Us</h4>
                                    <p className="text-2xl font-black text-[#1C1D1D]">+44 7565 678822</p>
                                </div>
                            </div>

                            <div className="flex gap-8 group">
                                <div className="w-16 h-16 bg-[#F8F9FA] rounded-3xl flex items-center justify-center text-accent-lime transition-colors group-hover:bg-accent-lime group-hover:text-white shadow-sm border border-black/5">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1C1D1D]/30 mb-2">Email Support</h4>
                                    <p className="text-2xl font-black text-[#1C1D1D]">info@teza.uk</p>
                                </div>
                            </div>

                            <div className="flex gap-8 group">
                                <div className="w-16 h-16 bg-[#F8F9FA] rounded-3xl flex items-center justify-center text-accent-lime transition-colors group-hover:bg-accent-lime group-hover:text-white shadow-sm border border-black/5">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1C1D1D]/30 mb-2">Central Office</h4>
                                    <p className="text-2xl font-black text-[#1C1D1D]">Hackney, London, UK</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form or Visual Card */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-accent-lime/5 rounded-[3rem] blur-3xl" />
                        <div className="relative bg-[#1C1D1D] p-12 rounded-[2.5rem] shadow-2xl h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Newsletter</h3>
                                <p className="text-white/40 mb-10 leading-relaxed font-medium">Join our community of meat enthusiasts. Get exclusive offers, recipes, and farm-to-door updates.</p>
                                
                                <div className="space-y-4">
                                    <input 
                                        type="email" 
                                        placeholder="YOUR EMAIL ADDRESS" 
                                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-bold text-xs tracking-widest focus:outline-none focus:border-accent-lime transition-colors"
                                    />
                                    <button className="w-full bg-accent-lime text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-hover transition-colors">
                                        Subscribe Now
                                    </button>
                                </div>
                            </div>
                            
                            <div className="pt-12 mt-12 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Follow Us</span>
                                <div className="flex gap-6">
                                    {['FB', 'IG', 'TW'].map(social => (
                                        <span key={social} className="text-xs font-black text-white hover:text-accent-lime cursor-pointer transition-colors">{social}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
