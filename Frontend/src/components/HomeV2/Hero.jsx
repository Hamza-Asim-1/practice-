import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../../config/branding';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const Hero = () => {
    const containerRef = useRef(null);
    const mainTitleRef = useRef(null);
    const imageRef = useRef(null);
    const navigate = useNavigate();

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Initial Reveal
        tl.fromTo('.hero-bg-layer', 
            { scale: 1.1, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }
        )
        .fromTo('.hero-content-main', 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 1.5 }, 
            "-=1.5"
        )
        .fromTo('.floating-meat', 
            { x: 100, opacity: 0, rotate: 5 }, 
            { x: 0, opacity: 1, rotate: 0, duration: 2, ease: "expo.out" }, 
            "-=1.2"
        )
        .fromTo('.hero-text-outline', 
            { x: -100, opacity: 0 }, 
            { x: 0, opacity: 0.1, duration: 2 }, 
            "-=1.8"
        );

        // Continuous Floating Animation for the meat
        gsap.to('.floating-meat', {
            y: -20,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Parallax on Scroll
        gsap.to('.hero-bg-layer', {
            y: 150,
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        gsap.to('.floating-meat', {
            y: -100,
            rotate: -10,
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        gsap.to('.hero-text-outline', {
            x: 200,
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

    }, { scope: containerRef });

    return (
        <section 
            ref={containerRef} 
            className="relative min-h-[110vh] overflow-hidden bg-[#0A0A0B] flex items-center justify-center pt-40 pb-20 lg:py-20"
        >
            {/* Background Layers */}
            <div className="hero-bg-layer absolute inset-0 z-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center brightness-[0.4]"
                    style={{ backgroundImage: 'url("/assets/images/meat-hero-bg.png")' }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-[#0A0A0B]/80 via-transparent to-[#0A0A0B]" />
            </div>

            {/* Cinematic Background Text (Outline) */}
            <div className="hero-text-outline absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none select-none z-1 whitespace-nowrap">
                <h2 className="text-[25vw] font-black italic tracking-tighter text-transparent border-text uppercase opacity-10">
                    PREMIUM CUTS
                </h2>
            </div>

            <div className="teza-container relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                
                {/* Left Content Column */}
                <div className="hero-content-main flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <span className="w-12 h-px bg-accent-lime" />
                        <span className="text-accent-lime text-xs font-black tracking-[0.4em] uppercase">Est. 1994 • London</span>
                    </div>
                    
                    <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black leading-[0.85] tracking-[-0.04em] text-white uppercase mb-8">
                        The art of<br />
                        <span className="text-accent-lime italic">Butchery.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-white/50 max-w-[500px] mb-12 font-medium leading-relaxed">
                        Ethically sourced, dry-aged to perfection. Experience the finest HMC-certified British meat delivered directly to your kitchen.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                        <button 
                            onClick={() => navigate('/products')}
                            className="bg-accent-lime hover:bg-accent-hover text-black px-10 py-5 rounded-none font-black text-sm tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(186,205,56,0.2)]"
                        >
                            Explore selection
                        </button>
                        <button className="text-white/40 hover:text-white font-black text-sm tracking-[0.2em] uppercase transition-colors group flex items-center gap-3">
                            Our heritage
                            <span className="w-8 h-px bg-white/20 group-hover:w-12 group-hover:bg-accent-lime transition-all" />
                        </button>
                    </div>

                    <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/5 pt-8">
                        <div>
                            <div className="text-2xl font-black text-white mb-1">100%</div>
                            <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">HMC Certified</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white mb-1">Fresh</div>
                            <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Farm to Table</div>
                        </div>
                    </div>
                </div>

                {/* Right Visual Column (The Masterpiece) */}
                <div className="relative flex-1 flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
                    <div className="relative group">
                        {/* Glow and Shadow Effects behind the meat */}
                        <div className="absolute inset-0 bg-accent-lime/20 blur-[120px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
                        
                        <div className="floating-meat relative z-20 w-[300px] md:w-[450px] lg:w-[550px] xl:w-[650px] drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
                            <img 
                                src="/assets/images/wagyu-hero.png" 
                                alt="Premium Meat Slab" 
                                className="w-full h-auto object-contain transform-gpu scale-110 group-hover:scale-115 transition-transform duration-700"
                            />
                            
                            {/* Artistic Floating Labels */}
                            <div className="absolute top-[20%] -right-8 md:-right-12 bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-6 rounded-2xl animate-pulse delay-700">
                                <div className="text-accent-lime text-xl md:text-2xl font-black mb-1 italic pr-4 md:pr-8">Grade A*</div>
                                <div className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold">Wagyu Standard</div>
                            </div>

                            <div className="absolute -bottom-8 -left-8 md:-left-12 bg-black/40 backdrop-blur-xl border border-white/5 p-4 md:p-6 rounded-2xl">
                                <div className="text-white text-xl md:text-2xl font-black mb-1 italic">Dry Aged</div>
                                <div className="text-[8px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold">28 Days Maturity</div>
                            </div>
                        </div>

                        {/* Aesthetic Geometric Accents */}
                        <div className="absolute -top-10 -left-10 w-24 h-24 border-t-2 border-l-2 border-accent-lime/30 rounded-tl-[70px]" />
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 border-b-2 border-r-2 border-accent-lime/30 rounded-br-[100px]" />
                    </div>
                </div>

            </div>

            {/* Bottom Reveal Scroll Cue */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 opacity-30">
                <span className="text-[10px] text-white font-black uppercase tracking-[0.5em]">Scroll</span>
                <div className="w-px h-16 bg-linear-to-b from-accent-lime to-transparent" />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .border-text {
                    -webkit-text-stroke: 1px rgba(255,255,255,1);
                }
            `}} />
        </section>
    );
};

export default Hero;
