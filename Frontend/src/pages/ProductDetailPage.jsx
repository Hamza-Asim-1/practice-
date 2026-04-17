import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../context/CartContext';
import { BRAND, DEFAULT_PRODUCT_IMAGE } from '../config/branding';
import { useProduct, useProducts } from '../hooks/useProducts';
import { normalizeSpecifications } from '../utils/specUtils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem, openCart } = useCart();
    const containerRef = useRef(null);
    const relatedGridRef = useRef(null);

    // React Query hooks
    const { data: product, isLoading: loading } = useProduct(id);
    
    const activeCategory = product?.category?.toUpperCase() || 'BEEF';
    const { data: relatedRes, isLoading: relatedLoading } = useProducts({
        category: activeCategory,
        limit: 10 // Fetch enough to filter out current product
    });

    const relatedProducts = (relatedRes?.data || [])
        .filter(p => p.id !== id)
        .slice(0, 3);

    const [selectedSpecs, setSelectedSpecs] = useState({});
    const [specialNotes, setSpecialNotes] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (product?.specifications) {
            const normalized = normalizeSpecifications(product.specifications);
            const initialSpecs = {};
            Object.entries(normalized).forEach(([key, values]) => {
                if (Array.isArray(values) && values.length > 0) {
                    initialSpecs[key] = values[0];
                }
            });
            setSelectedSpecs(initialSpecs);
        }
    }, [product]);

    useGSAP(() => {
        if (!loading && product) {
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
            tl.fromTo('.product-reveal', 
                { y: 40, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }
            );
        }

        if (!relatedLoading && relatedProducts.length > 0) {
            gsap.fromTo('.related-card', 
                { y: 40, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.8, 
                    stagger: 0.1, 
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: relatedGridRef.current,
                        start: "top 85%",
                    }
                }
            );
        }
    }, [loading, product, relatedLoading, relatedProducts.length]);

    const handleAddToCart = () => {
        const customisations = {
            ...selectedSpecs,
            specialNotes,
            extraCost: 0
        };
        addItem(product, customisations, quantity);
        openCart();
    };

    const handleImageError = (e) => {
        if (e.target.src !== DEFAULT_PRODUCT_IMAGE) {
            e.target.src = DEFAULT_PRODUCT_IMAGE;
        }
    };

    const Selector = ({ label, options, value, setter }) => (
        <div className="mb-10 product-reveal">
            <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">{label}</label>
                <div className="w-12 h-px bg-black/5" />
            </div>
            <div className="flex flex-wrap gap-2.5">
                {options.map(opt => (
                    <button 
                        key={opt} 
                        className={`px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 border-2 ${
                            value === opt 
                            ? 'bg-text-cream text-white border-text-cream shadow-xl scale-105' 
                            : 'bg-transparent text-black/40 border-black/5 hover:border-black/20 hover:text-black'
                        }`} 
                        onClick={() => setter(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) return (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-10000">
             <div className="flex flex-col items-center gap-6">
                <span className="font-['Brush_Script_MT',cursive] text-6xl text-accent-lime animate-pulse">
                    {BRAND.name}
                </span>
                <div className="w-32 h-[2px] bg-black/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent-lime animate-loader-slide" />
                </div>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <h1 className="text-text-cream text-3xl font-black uppercase tracking-tighter mb-6 italic">Cut Not Found</h1>
                <p className="text-black/40 mb-10 leading-relaxed font-medium">The specific selection you're looking for might have been temporarily removed from our vault.</p>
                <button onClick={() => navigate('/products')} className="lime-btn w-full">Back to Collection</button>
            </div>
        </div>
    );

    const totalPrice = Number(product.basePrice) * quantity;

    return (
        <main ref={containerRef} className="bg-white min-h-screen">
            <Helmet>
                <title>{`${product.name} | ${BRAND.name} - Premium Master Selection`}</title>
                <meta name="description" content={product.description || `Order premium ${product.category} online. British HMC-certified meat delivered to your door.`} />
            </Helmet>

            {/* Immersive Header (Split View) */}
            <section className="relative flex flex-col lg:flex-row min-h-[90vh] overflow-hidden">
                
                {/* Visual Side (The Masterpiece) */}
                <div 
                    className="relative flex-1 overflow-hidden flex items-start justify-center p-8 lg:p-20 pt-20 lg:pt-48"
                    style={{ background: 'linear-gradient(to bottom, rgba(186, 205, 56, 0.4) 0%, #F5F5F7 50%, #F5F5F7 100%)' }}
                >
                    {/* Background Accents */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[60vw] h-[60vw] bg-accent-lime/10 blur-[150px] rounded-full opacity-30" />
                    
                    <div className="relative z-10 w-full h-full max-w-[800px] flex items-start justify-center">
                         <img 
                            src={product.imageUrl || DEFAULT_PRODUCT_IMAGE} 
                            alt={product.name}
                            onError={handleImageError}
                            className="w-full h-auto object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.15)] product-reveal transform transition-transform duration-1000 hover:scale-105"
                        />
                        
                        {/* Grade Banners */}
                        <div className="absolute top-0 right-0 p-8 flex flex-col gap-4 product-reveal">
                             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-black/5 bg-white shadow-2xl flex flex-col items-center justify-center">
                                <span className="text-lg md:text-xl font-black italic leading-none">A*</span>
                                <span className="text-[6px] md:text-[7px] font-black uppercase tracking-widest text-black/30">Grade</span>
                            </div>
                            {product.isHmcCertified && (
                                <div className="bg-text-cream text-white px-4 md:px-5 py-2 md:py-2.5 rounded-2xl flex items-center gap-2 md:gap-3 shadow-2xl">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent-lime">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">HMC Gold</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aesthetic Watermark */}
                    <div className="absolute bottom-10 left-10 pointer-events-none opacity-5 product-reveal">
                        <span className="font-['Brush_Script_MT',cursive] text-[15vw] text-black leading-none">{BRAND.name}</span>
                    </div>
                </div>

                {/* Configuration Side */}
                <div className="flex-1 bg-white pt-10 lg:pt-32 pb-24 lg:pb-40 px-6 sm:px-12 lg:px-24 overflow-y-auto">
                    <div className="max-w-xl mx-auto lg:mx-0">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-3 mb-10 product-reveal">
                            <button onClick={() => navigate('/products')} className="text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-colors">Collection</button>
                            <span className="w-4 h-px bg-black/10" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent-lime">{product.category}</span>
                        </div>

                        {/* Title & Description */}
                        <header className="mb-16 product-reveal">
                             <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] font-black text-text-cream leading-[0.85] tracking-tighter uppercase mb-8 italic">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-4 mb-8">
                                <span className="text-3xl md:text-4xl font-black text-text-cream italic tracking-tighter leading-none pr-4 border-r border-black/5">£{totalPrice.toFixed(2)}</span>
                                <div className="flex flex-col">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Estimated Cost</span>
                                </div>
                            </div>
                            <p className="text-base md:text-lg text-black/50 font-medium leading-relaxed italic border-l-4 border-accent-lime/20 pl-6">
                                "{product.description || 'A masterfully crafted cut, aged to perfection and prepared to your exact specification by our artisan butchers.'}"
                            </p>
                        </header>

                        <div className="space-y-4">
                            {/* The Spec Dossier */}
                            <div className="bg-[#F8F8FA] rounded-[3rem] p-10 sm:p-12 mb-12 border border-black/3 product-reveal">
                                <h2 className="text-xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
                                    <span className="w-8 h-[2px] bg-accent-lime" />
                                    The Artisan's Spec
                                </h2>

                                {product.specifications ? (
                                    (() => {
                                        const normalized = normalizeSpecifications(product.specifications);
                                        const entries = Object.entries(normalized).sort(([a], [b]) => a.localeCompare(b));
                                        
                                        if (entries.length === 0) {
                                            return <p className="text-sm text-black/40 italic">No custom specifications available for this cut.</p>;
                                        }

                                        return entries.map(([key, values]) => (
                                            <Selector 
                                                key={key}
                                                label={key} 
                                                options={values} 
                                                value={selectedSpecs[key] || values[0]} 
                                                setter={(val) => setSelectedSpecs(prev => ({ ...prev, [key]: val }))} 
                                            />
                                        ));
                                    })()
                                ) : (
                                    <p className="text-sm text-black/40 italic">No custom specifications available for this cut.</p>
                                )}

                                <div className="mt-12 product-reveal">
                                    <label className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-4">Butcher's Instructions</label>
                                    <textarea
                                        value={specialNotes}
                                        onChange={e => setSpecialNotes(e.target.value.slice(0, 150))}
                                        placeholder="Add specific requests for our butchers..."
                                        maxLength={150}
                                        className="w-full bg-white border border-black/5 text-black p-6 rounded-3xl text-sm min-h-[140px] outline-none transition-all focus:border-accent-lime focus:ring-8 focus:ring-accent-lime/5 placeholder:italic placeholder:text-black/20"
                                    />
                                    <div className="mt-3 text-right">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-black/10">{specialNotes.length}/150 Characters</span>
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Actions */}
                            <div className="flex flex-col sm:flex-row gap-6 product-reveal pt-8">
                                <div className="flex items-center bg-[#F8F8FA] border border-black/5 rounded-2xl h-[72px] p-1.5 min-w-[160px]">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-full flex items-center justify-center text-black/40 text-2xl font-light hover:text-black transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="flex-1 text-center font-black text-lg">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-full flex items-center justify-center text-black/40 text-2xl font-light hover:text-black transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    className="grow h-[72px]! bg-text-cream text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] transition-all hover:bg-accent-lime hover:text-black hover:shadow-[0_20px_40px_rgba(186,205,56,0.3)] hover:-translate-y-1 active:scale-95" 
                                    onClick={handleAddToCart}
                                >
                                    Add to Cart
                                </button>
                            </div>

                            {/* Trust Footer */}
                            <div className="mt-24 grid grid-cols-2 gap-8 border-t border-black/5 pt-16 product-reveal">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block mb-3">Sourcing</span>
                                    <p className="text-[11px] font-black text-black/70 leading-relaxed uppercase">{product.supplier?.name || 'British Farm Traceable'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block mb-3">Certification</span>
                                    <p className="text-[11px] font-black text-black/70 leading-relaxed uppercase">
                                        {product.isHmcCertified ? (product.supplier?.hmcCertNumber ? `100% Halal Certified (HMC: ${product.supplier.hmcCertNumber})` : '100% Halal Certified') : 'Quality Assured'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block mb-3">Packaging</span>
                                    <p className="text-[11px] font-black text-black/70 leading-relaxed uppercase">Eco-Friendly Insulation</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 block mb-3">Delivery</span>
                                    <p className="text-[11px] font-black text-black/70 leading-relaxed uppercase">Next Day Guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Selections Section */}
            {!relatedLoading && relatedProducts.length > 0 && (
                <section className="bg-white pt-20 lg:pt-32 pb-32 lg:pb-48 border-t border-black/5">
                    <div className="teza-container">
                        <header className="mb-20 text-center">
                            <div className="inline-flex items-center gap-4 mb-8">
                                <span className="w-12 h-px bg-accent-lime shadow-[0_0_10px_rgba(186,205,56,0.5)]" />
                                <span className="text-black/30 text-[10px] font-black uppercase tracking-[0.4em]">Discovery</span>
                                <span className="w-12 h-px bg-accent-lime shadow-[0_0_10px_rgba(186,205,56,0.5)]" />
                            </div>
                            <h2 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-text-cream uppercase tracking-tighter leading-none mb-6 italic">
                                Related Selections.
                            </h2>
                            <p className="text-black/40 text-sm font-medium italic">Other premium cuts from the {product.category} collection you might admire.</p>
                        </header>

                        <div ref={relatedGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
                            {relatedProducts.map(rel => (
                                <Link 
                                    to={`/products/${rel.id}`} 
                                    key={rel.id} 
                                    className="related-card group flex flex-col"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    {/* Same design as Catalogue Card */}
                                    <div className="relative aspect-4/5 overflow-hidden rounded-[3rem] bg-[#F5F5F7] mb-8 shadow-2xl transition-all duration-700 hover:shadow-[0_50px_80px_rgba(0,0,0,0.15)] group-hover:-translate-y-4">
                                        <img 
                                            src={rel.imageUrl || DEFAULT_PRODUCT_IMAGE} 
                                            alt={rel.name}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                        <div className="absolute top-8 left-8 flex flex-col gap-3 z-30">
                                            <div className="bg-accent-lime text-black px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                                    {rel.supplier?.name || 'British Farms'}
                                                </div>
                                                <div className="text-[8px] opacity-70">
                                                    {rel.isHmcCertified ? (rel.supplier?.hmcCertNumber ? `HMC: ${rel.supplier.hmcCertNumber}` : 'HMC Certified') : rel.category}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-8 right-8 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-lg font-black italic">
                                                A*
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 flex flex-col grow">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex-1">
                                                <h3 className="text-xl md:text-2xl font-black text-text-cream uppercase tracking-tighter leading-none mb-3 group-hover:text-accent-lime transition-colors">
                                                    {rel.name}
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-black/30 uppercase tracking-[0.2em]">HMC GOLD</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl md:text-3xl font-black text-text-cream italic tracking-tighter">£{Number(rel.basePrice).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="mt-auto group/btn flex items-center gap-4">
                                            <div className="flex-1 h-px bg-black/5 group-hover:bg-accent-lime/30 transition-colors" />
                                            <div className="text-[11px] font-black uppercase tracking-[0.3em] text-text-cream flex items-center gap-4 group-hover:text-accent-lime transition-all">
                                                View Spec
                                                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center transition-all group-hover/btn:bg-accent-lime group-hover/btn:text-black">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default ProductDetailPage;
