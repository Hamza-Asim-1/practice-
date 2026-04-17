import React from 'react';

const AboutUs = () => {
    return (
        <section id="about" className="relative py-32 overflow-hidden bg-white">
            <div className="teza-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    {/* Chicken Cuts Diagram Box */}
                    <div className="relative group perspective-1000">
                        <div className="absolute inset-0 bg-accent-lime/5 rounded-3xl blur-3xl transition-all duration-700 group-hover:bg-accent-lime/10" />
                        <div className="relative bg-white p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden transform transition-transform duration-700 hover:rotate-1">
                            <img 
                                src="/assets/images/chicken-diagram.png" 
                                alt="Vintage Chicken Cuts Diagram"
                                className="w-full h-auto grayscale transition-all duration-700 group-hover:grayscale-0"
                            />
                            {/* Decorative Corner Elements */}
                            <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-accent-lime/20" />
                            <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-accent-lime/20" />
                            <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-accent-lime/20" />
                            <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-accent-lime/20" />
                        </div>
                    </div>

                    {/* Brand Content */}
                    <div>
                        <div className="mb-12">
                            <span className="text-accent-lime font-black text-xs uppercase tracking-[0.4em] mb-6 block">Our Legacy</span>
                            <h3 className="text-5xl md:text-6xl font-black text-[#1C1D1D] uppercase leading-[0.9] mb-10 tracking-tight">
                                Quality Meat<br />
                                <span className="bg-accent-lime text-white px-2 mt-2 inline-block">Perfected</span>
                            </h3>
                            <p className="text-xl text-[#1C1D1D]/80 leading-relaxed font-medium mb-8">
                                We are the premium choice for ethically sourced poultry. Our mission is to deliver professional-grade freshness directly to your kitchen.
                            </p>
                            <p className="text-[#1C1D1D]/50 leading-relaxed font-medium">
                                With the brand name <span className="text-[#1C1D1D] font-bold underline decoration-accent-lime decoration-2 underline-offset-4">Chickeat</span>, we meet your animal protein needs through hygienically packaged, HMC-certified products of verified British origin.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-10">
                            <div>
                                <div className="w-12 h-1 bg-accent-lime mb-6" />
                                <h4 className="font-black text-xl mb-3 uppercase text-[#1C1D1D] tracking-tight">The Problem</h4>
                                <p className="text-sm text-[#1C1D1D]/60 leading-relaxed">
                                    Finding truly fresh, ethical, and Halal-certified meat in the UK was a challenge. Supermarket quality was inconsistent and origins were often opaque.
                                </p>
                            </div>
                            <div>
                                <div className="w-12 h-1 bg-accent-lime mb-6" />
                                <h4 className="font-black text-xl mb-3 uppercase text-[#1C1D1D] tracking-tight">Our Solution</h4>
                                <p className="text-sm text-[#1C1D1D]/60 leading-relaxed">
                                    A transparent supply chain directly from Red Tractor farms. We offer custom portioning and 48-hour farm-to-door delivery with cold-chain protection.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
