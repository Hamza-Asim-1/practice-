import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCancelPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-[80vh] p-4 md:p-8 bg-[#F8F9FA] relative overflow-hidden pt-32 md:pt-[140px]">
            {/* Background Accent */}
            <div className="absolute -top-1/4 -right-1/4 w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(239,68,68,0.03)_0%,transparent_70%)] z-1"></div>

            <div className="bg-white border border-black/5 p-8 md:p-16 rounded-4xl text-center max-w-[550px] w-full z-2 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full flex items-center justify-center text-4xl md:text-[3rem] mx-auto mb-6 md:mb-8 relative bg-red-500/10 text-red-500 after:content-[''] after:absolute after:inset-[-12%] after:rounded-full after:border after:border-red-500 after:opacity-20 after:animate-pulse">
                    ✕
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-[#1C1D1D]">
                    Payment Cancelled
                </h1>
                <p className="text-black/40 mb-10 text-[1.1rem] leading-relaxed">
                    The transaction was not completed. Your premium selection is still waiting in your cart.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                    <button className="grow h-[64px]! inline-flex items-center justify-center bg-accent-lime text-black rounded-full font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(186,205,56,0.3)] hover:-translate-y-1 active:scale-95" onClick={() => navigate('/checkout')}>Return to Checkout</button>
                    <button 
                        className="flex-1 bg-transparent border border-black/10 text-[#1C1D1D] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:bg-black/5 hover:border-black/20 active:scale-95" 
                        onClick={() => navigate('/products')}
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderCancelPage;
