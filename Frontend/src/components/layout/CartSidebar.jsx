import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartSidebar = () => {
    const { items, isCartOpen, closeCart, updateQuantity, removeItem, subtotal } = useCart();
    const navigate = useNavigate();

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeCart();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeCart]);

    return (
        <div 
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
            onClick={closeCart}
        >
            <div 
                className={`absolute top-0 right-0 w-full max-w-[450px] h-full bg-white flex flex-col shadow-[-10px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-l border-black/5 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-[30px] flex justify-between items-center border-b border-black/5">
                    <h2 className="text-[20px] font-black tracking-tighter uppercase italic text-[#1a1a1a]">Your Cart ({items.length})</h2>
                    <button className="bg-transparent text-[#999] transition-all hover:text-black hover:scale-110 cursor-pointer" onClick={closeCart}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-[30px] space-y-8 no-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-5 text-[#999]">
                            <p className="text-lg font-bold italic tracking-tight">Your cart is empty</p>
                            <button className="lime-btn" onClick={() => { closeCart(); navigate('/products'); }}>Start Shopping</button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="grid grid-cols-[80px_1fr] gap-5 pb-8 border-b border-black/5 last:border-0 last:pb-0">
                                <div className="w-20 h-20 bg-[#f8f9fa] rounded-2xl overflow-hidden flex items-center justify-center border border-black/5 p-1">
                                    {item.product.imageUrl ? (
                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-contain" onError={(e) => { e.target.src = DEFAULT_PRODUCT_IMAGE; }} />
                                    ) : (
                                        <div className="text-2xl">🍖</div>
                                    )}
                                </div>
                                <div className="flex flex-col grow min-w-0">
                                    <h3 className="text-base font-black uppercase text-[#1a1a1a] mb-1 truncate">{item.product.name}</h3>
                                    <p className="text-[11px] text-[#999] mb-4 font-bold uppercase tracking-wider">{item.customisations.weight} · {item.customisations.cutType}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="flex items-center bg-[#f8f9fa] rounded-full p-1 border border-black/5">
                                            <button 
                                                onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                                                className="w-8 h-8 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center font-bold border border-black/5 hover:bg-black hover:text-white transition-all shadow-sm"
                                            >−</button>
                                            <span className="min-w-[34px] text-center text-sm font-black text-[#1a1a1a]">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center font-bold border border-black/5 hover:bg-black hover:text-white transition-all shadow-sm"
                                            >+</button>
                                        </div>
                                        <span className="font-black italic text-accent-lime text-lg">£{(item.unitPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-[30px] bg-[#f8f9fa] border-t border-black/5">
                        <div className="flex justify-between items-center text-lg font-black italic mb-2.5 text-[#1a1a1a]">
                            <span>Subtotal</span>
                            <span>£{subtotal.toFixed(2)}</span>
                        </div>
                        <p className="text-[12px] text-[#999] mb-6 font-bold uppercase tracking-widest">Taxes and Shipping calculated next.</p>
                        <button className="lime-btn w-full !h-16 !rounded-2xl shadow-[0_10px_30px_rgba(186,205,56,0.2)]" onClick={() => { closeCart(); navigate('/checkout'); }}>
                            Secure Checkout →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartSidebar;
