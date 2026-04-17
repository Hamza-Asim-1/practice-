import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DEFAULT_PRODUCT_IMAGE } from '../../config/branding';

gsap.registerPlugin(useGSAP);

const CATEGORIES = [
    { name: 'Beef', image: '/assets/images/categories/beef.png', tagline: 'The Gold Standard', colSpan: 'md:col-span-8', rowSpan: 'md:row-span-2' },
    { name: 'Lamb', image: '/assets/images/categories/lamb.png', tagline: 'Tender & Fresh', colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1' },
    { name: 'Poultry', image: '/assets/images/categories/poultry.png', tagline: 'Organic Quality', colSpan: 'md:col-span-4', rowSpan: 'md:row-span-1' },
    { name: 'Goat', image: '/assets/images/categories/goat.png', tagline: 'Traditional Flavor', colSpan: 'md:col-span-12', rowSpan: 'md:row-span-1' }
];

const ProductGrid = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);

    useGSAP(() => {
        gsap.from('.gallery-item', {
            opacity: 0,
            y: 30,
            duration: 1.2,
            stagger: 0.15,
            ease: "expo.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 75%"
            }
        });
    }, { scope: containerRef });

    return (
        <section id="products" ref={containerRef} className="py-32 bg-bg-dark">
            <div className="teza-container">
                {/* Editorial Header */}
                <div className="flex flex-col lg:flex-row items-baseline justify-between mb-24 gap-8 border-b border-black/5 pb-12">
                    <div className="max-w-2xl">
                        <h3 className="text-[clamp(3rem,8vw,5.5rem)] font-black text-text-cream uppercase leading-[0.8] tracking-tighter mb-4 transition-all">
                            Taste the <br />
                            <span className="text-accent-lime italic">Heritage.</span>
                        </h3>
                    </div>
                    <div className="lg:text-right max-w-sm">
                        <p className="text-text-cream/50 font-medium leading-relaxed uppercase text-[10px] tracking-[0.3em]">
                            Direct from British farms to your table. Our master butchers select only the finest HMC-certified cuts.
                        </p>
                    </div>
                </div>

                {/* Asymmetric Artistic Gallery (4 Items) */}
                <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[250px] md:auto-rows-[300px] gap-8">
                    
                    {/* BEEF - Large Feature */}
                    <div 
                        onClick={() => navigate('/products?category=Beef')}
                        className="gallery-item md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-[3rem] cursor-pointer bg-black/5 shadow-2xl shadow-black/5"
                    >
                        <img 
                            src={CATEGORIES[0].image} 
                            alt="Beef" 
                            onError={(e) => {
                                if (e.target.src !== DEFAULT_PRODUCT_IMAGE) {
                                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                                }
                            }}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                        <div className="absolute bottom-12 left-12">
                            <span className="text-accent-lime font-black text-[10px] uppercase tracking-[0.4em] mb-4 block transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">Premium Grade</span>
                            <h4 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2 text-white">BEEF</h4>
                            <p className="text-white/60 text-xs font-bold tracking-widest">{CATEGORIES[0].tagline}</p>
                        </div>
                    </div>

                    {/* LAMB - Small Tile */}
                    <div 
                        onClick={() => navigate('/products?category=Lamb')}
                        className="gallery-item md:col-span-4 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] cursor-pointer bg-black/5"
                    >
                        <img 
                            src={CATEGORIES[1].image} 
                            alt="Lamb" 
                            onError={(e) => {
                                if (e.target.src !== DEFAULT_PRODUCT_IMAGE) {
                                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                                }
                            }}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                            <h4 className="text-4xl font-black uppercase tracking-tighter mb-1 transform group-hover:-translate-y-2 transition-transform duration-500">LAMB</h4>
                            <span className="h-px w-8 bg-accent-lime transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* POULTRY - Small Tile */}
                    <div 
                        onClick={() => navigate('/products?category=Poultry')}
                        className="gallery-item md:col-span-4 md:row-span-1 group relative overflow-hidden rounded-[2.5rem] cursor-pointer bg-black/5"
                    >
                        <img 
                            src={CATEGORIES[2].image} 
                            alt="Poultry" 
                            onError={(e) => {
                                if (e.target.src !== DEFAULT_PRODUCT_IMAGE) {
                                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                                }
                            }}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
                            <h4 className="text-4xl font-black uppercase tracking-tighter mb-1 transform group-hover:-translate-y-2 transition-transform duration-500">POULTRY</h4>
                            <span className="h-px w-8 bg-accent-lime transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* GOAT - Medium Bottom Wide Tile (Modern Horizontal) */}
                    <div 
                        onClick={() => navigate('/products?category=Goat')}
                        className="gallery-item md:col-span-12 md:row-span-1 group relative overflow-hidden rounded-[3rem] cursor-pointer bg-black/5"
                    >
                        <img 
                            src={CATEGORIES[3].image} 
                            alt="Goat" 
                            onError={(e) => e.target.src = DEFAULT_PRODUCT_IMAGE}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/20 to-transparent transition-all" />
                        <div className="absolute inset-y-0 left-0 w-full md:w-1/2 flex flex-col justify-center p-12 lg:p-20">
                            <span className="text-accent-lime font-black text-[10px] uppercase tracking-[0.4em] mb-4 block transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700">Specialty Cut</span>
                            <h4 className="text-white text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 group-hover:text-accent-lime transition-colors">GOAT</h4>
                            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">{CATEGORIES[3].tagline}: Distinctive, lean, and intensely flavorful cuts for traditionalist palates.</p>
                        </div>
                        <div className="absolute bottom-12 right-12 hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent-lime transition-all duration-500">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
