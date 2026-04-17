import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { items, clearCart } = useCart();
    
    const paymentIntent = searchParams.get('payment_intent');
    const orderId = searchParams.get('order_id');
    const reference = paymentIntent || orderId;

    useEffect(() => {
        if (items.length > 0) {
            clearCart();
        }
    }, [clearCart, items.length]);

    return (
        <div className="flex items-center justify-center min-h-[80vh] p-4 md:p-8 bg-[#F8F9FA] relative overflow-hidden pt-32 md:pt-[140px]">
            {/* Background Accent */}
            <div className="absolute -top-1/4 -right-1/4 w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(192,215,45,0.05)_0%,transparent_70%)] z-1"></div>
            
            <div className="bg-white border border-black/5 p-8 md:p-16 rounded-4xl text-center max-w-[550px] w-full z-2 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full flex items-center justify-center text-4xl md:text-[3rem] mx-auto mb-6 md:mb-8 relative bg-accent-lime/10 text-accent-lime after:content-[''] after:absolute after:inset-[-12%] after:rounded-full after:border after:border-accent-lime after:opacity-20 after:animate-pulse">
                    ✓
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-[#1C1D1D]">
                    Order Confirmed!
                </h1>
                <p className="text-black/40 mb-10 text-[1.1rem] leading-relaxed">
                    Premium cuts are now reserved for you. Our butchers are getting ready to prepare your selection.
                </p>
                
                {reference && (
                    <div className="bg-black/5 border border-black/5 p-4 rounded-2xl mb-10 text-accent-lime font-mono tracking-widest uppercase">
                        <small>Reference: {reference.slice(-8).toUpperCase()}</small>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-6">
                    <button className="grow h-[64px]! inline-flex items-center justify-center bg-accent-lime text-black rounded-full font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(186,205,56,0.3)] hover:-translate-y-1 active:scale-95" onClick={() => navigate('/account/orders')}>View My Orders</button>
                    <button 
                        className="flex-1 bg-transparent border border-black/10 text-[#1C1D1D] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:bg-black/5 hover:border-black/20 active:scale-95" 
                        onClick={() => navigate('/products')}
                    >
                        Keep Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
