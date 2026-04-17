import React, { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BRAND, DEFAULT_PRODUCT_IMAGE } from '../config/branding';
import { CATEGORY_KEYS } from '../config/products';
import { useProducts } from '../hooks/useProducts';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CataloguePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = 9;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const activeCategory = searchParams.get('category')?.toUpperCase() || 'ALL';
    
    const containerRef = useRef(null);
    const gridRef = useRef(null);

    // React Query hook replaces manual state + useEffect
    const { data: res, isLoading: loading } = useProducts({
        category: activeCategory === 'ALL' ? undefined : activeCategory,
        page,
        limit
    });

    const products = res?.data || [];
    const totalItems = res?.total || 0;

    const setPage = (p) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', p);
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setActiveCategory = (cat) => {
        const newParams = new URLSearchParams();
        if (cat !== 'ALL') newParams.set('category', cat);
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    useGSAP(() => {
        if (!loading && products.length > 0) {
            gsap.fromTo('.product-card', 
                { y: 50, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    stagger: 0.1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: gridRef.current,
                        start: "top 80%",
                    }
                }
            );
        }
    }, [loading, products]);

    const handleImageError = (e) => {
        if (e.target.src !== DEFAULT_PRODUCT_IMAGE) {
            e.target.src = DEFAULT_PRODUCT_IMAGE;
        }
    };

    return (
        <main ref={containerRef} className="bg-[#0A0A0B] min-h-screen">
            <Helmet>
                <title>{`Catalogue | ${BRAND.name} - Premium Halal Meat`}</title>
                <meta name="description" content={`Browse our selection of premium HMC-certified British meats. Categories: ${CATEGORY_KEYS.slice(1).join(', ')}.`} />
            </Helmet>

            {/* Cinematic Header (Midnight Marble) */}
            <header className="relative pt-32 md:pt-44 pb-20 md:pb-32 overflow-hidden border-b border-white/5">
                {/* Background Marble */}
                <div className="absolute inset-0 opacity-40 pointer-events-none scale-110">
                    <img 
                        src="/assets/images/footer-marble.png" 
                        alt="" 
                        className="w-full h-full object-cover grayscale brightness-50"
                    />
                </div>
                
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-[#0A0A0B]/40 via-transparent to-[#0A0A0B]" />
                
                {/* Content */}
                <div className="teza-container relative z-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-4 mb-6 md:mb-8">
                        <span className="w-8 md:w-12 h-px bg-accent-lime shadow-[0_0_10px_rgba(186,205,56,0.5)]" />
                        <span className="text-accent-lime text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">The Collection</span>
                    </div>
                    
                    <h1 className="text-[clamp(2.5rem,8vw,7.5rem)] font-black text-white leading-[0.9] md:leading-[0.85] tracking-tighter uppercase mb-8 md:mb-10">
                        The Master<br className="hidden sm:block" />
                        <span className="font-['Brush_Script_MT',cursive] text-accent-lime lowercase pr-4 md:pr-6 italic drop-shadow-[0_0_30px_rgba(186,205,56,0.3)]">Selection.</span>
                    </h1>
                    
                    <p className="text-white/50 text-sm md:text-lg max-w-2xl font-medium leading-relaxed mb-10 md:mb-12 mx-auto lg:mx-0 px-4 lg:px-0">
                        Discover the definitive source for British HMC-certified premium cuts. Every slice is a testament to our artisan heritage and ethical sourcing standards.
                    </p>

                    {/* Stats Accents */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-12 pt-12 border-t border-white/5">
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="text-3xl font-black text-white leading-none mb-2 tracking-tighter italic">100%</span>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Halal Certified</span>
                        </div>
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="text-3xl font-black text-white leading-none mb-2 tracking-tighter italic">28+</span>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Days Dry Aged</span>
                        </div>
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="text-3xl font-black text-white leading-none mb-2 tracking-tighter italic">British</span>
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Red Tractor Farms</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Catalog Core Section (White Background for High Contrast) */}
            <section className="relative z-10 bg-white pt-24 pb-48 rounded-t-[4rem] sm:rounded-t-[6rem] -mt-16 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                <div className="teza-container">
                    
                    {/* Floating Filter Bar */}
                    <div className="sticky top-24 md:top-28 z-40 mb-16 md:mb-24 flex justify-center w-full px-4 overflow-hidden">
                        <div className="flex p-2 bg-black/5 backdrop-blur-2xl rounded-2xl border border-black/5 shadow-2xl max-w-full overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
                            {CATEGORY_KEYS.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 md:px-8 py-3 md:py-4 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500 relative shrink-0 ${
                                        activeCategory === cat 
                                        ? 'text-white' 
                                        : 'text-black/40 hover:text-black hover:bg-black/5'
                                    }`}
                                >
                                    {activeCategory === cat && (
                                        <div className="absolute inset-0 bg-[#0A0A0B] rounded-xl -z-10 shadow-[0_10px_20px_rgba(0,0,0,0.2)]" />
                                    )}
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Result Info */}
                    <div className="flex justify-between items-center mb-16 border-b border-black/5 pb-8">
                        <div>
                            <span className="text-black/30 text-xs font-black uppercase tracking-widest italic">{totalItems} Items found</span>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-px bg-black/10" />
                            Page {page} of {Math.ceil(totalItems / limit) || 1}
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-black/5 animate-pulse rounded-[3rem] aspect-4/5" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-24 md:py-40 border-4 border-dashed border-black/5 rounded-[3rem] md:rounded-[4rem] px-6">
                            <p className="text-xl md:text-3xl font-black text-black/10 uppercase tracking-widest italic leading-relaxed">No selection available in this category</p>
                        </div>
                    ) : (
                        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 md:gap-x-12 gap-y-16 md:gap-y-24">
                            {products.map(product => (
                                <Link 
                                    to={`/products/${product.id}`} 
                                    key={product.id} 
                                    className="product-card group flex flex-col"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-4/5 overflow-hidden rounded-[3rem] bg-bg-dark mb-8 shadow-2xl transition-all duration-700 hover:shadow-[0_50px_80px_rgba(0,0,0,0.15)] group-hover:-translate-y-4">
                                        <img 
                                            src={product.imageUrl || DEFAULT_PRODUCT_IMAGE} 
                                            alt={product.name}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        
                                        {/* Overlay Shadow */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        
                                        {/* Badges */}
                                        <div className="absolute top-8 left-8 flex flex-col gap-3 z-30">
                                            <div className="bg-accent-lime text-black px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                                    {product.supplier?.name || 'British Farms'}
                                                </div>
                                                <div className="text-[8px] opacity-70">
                                                    {product.isHmcCertified ? (product.supplier?.hmcCertNumber ? `HMC: ${product.supplier.hmcCertNumber}` : 'HMC Certified') : product.category}
                                                </div>
                                            </div>
                                            {product.isHmcCertified && (
                                                <div className="bg-black/80 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl text-[10px] font-black border border-white/10 shadow-lg flex items-center gap-2">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-lime">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                    </svg>
                                                    HMC Gold
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Grade Label */}
                                        <div className="absolute top-8 right-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-lg font-black italic">
                                                A*
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="px-4 md:px-6 flex flex-col grow">
                                        <div className="flex justify-between items-start mb-4 md:mb-6">
                                            <div className="flex-1">
                                                <h3 className="text-xl md:text-2xl font-black text-text-cream uppercase tracking-tighter leading-none mb-2 md:mb-3 group-hover:text-accent-lime transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <span className="text-[9px] md:text-[10px] font-black text-text-cream/50 uppercase tracking-[0.2em]">{product.supplier?.name || 'British Farms'}</span>
                                                    <div className="w-1 h-1 bg-black/10 rounded-full" />
                                                    <span className="text-[9px] md:text-[10px] font-black text-text-cream/50 uppercase tracking-[0.2em]">
                                                        {product.supplier?.hmcCertNumber ? `HMC: ${product.supplier.hmcCertNumber}` : 'HMC'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl md:text-3xl font-black text-text-cream italic tracking-tighter">£{Number(product.basePrice).toFixed(2)}</span>
                                                <p className="text-[8px] md:text-[9px] font-black text-black/20 uppercase tracking-widest">per kg</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-black/50 font-medium leading-[1.6] line-clamp-2 italic mb-10">
                                            "{product.description || 'Masterfully crafted cut, aged for minimum 28 days to ensure peak tenderness and flavor profile.'}"
                                        </p>

                                        {/* Button */}
                                        <div className="mt-auto group/btn flex items-center gap-4">
                                            <div className="flex-1 h-px bg-black/5 group-hover:bg-accent-lime/30 transition-colors" />
                                            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-text-cream flex items-center gap-4 group-hover:text-accent-lime transition-all">
                                                View Spec
                                                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center transition-all group-hover/btn:bg-accent-lime group-hover/btn:text-black">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && totalItems > limit && (
                        <div className="mt-20 md:mt-32 flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 overflow-hidden">
                            <button 
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className={`group flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all duration-500 ${
                                    page === 1 
                                    ? 'opacity-20 cursor-not-allowed border-black/5 text-black/20' 
                                    : 'border-black/5 text-black hover:border-black hover:bg-black hover:text-white hover:shadow-2xl'
                                }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Prev</span>
                            </button>

                            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar py-2">
                                {[...Array(Math.ceil(totalItems / limit))].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black transition-all duration-500 ${
                                            page === i + 1 
                                            ? 'bg-accent-lime text-black shadow-lg scale-110' 
                                            : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'
                                        }`}
                                    >
                                        {(i + 1).toString().padStart(2, '0')}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => setPage(Math.min(Math.ceil(totalItems / limit), page + 1))}
                                disabled={page === Math.ceil(totalItems / limit)}
                                className={`group flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all duration-500 ${
                                    page === Math.ceil(totalItems / limit)
                                    ? 'opacity-20 cursor-not-allowed border-black/5 text-black/20' 
                                    : 'border-black/5 text-black hover:border-black hover:bg-black hover:text-white hover:shadow-2xl'
                                }`}
                            >
                                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest">Next</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default CataloguePage;
