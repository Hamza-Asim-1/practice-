import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const API_BASE = import.meta.env.VITE_API_BASE;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ clientSecret, onCancel, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
        } else {
            onSuccess();
        }
        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-xl">
                <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
            </div>
            {message && <div id="payment-message" className="p-4 bg-red-500/10 border border-red-500/20 text-[#ff6b6b] text-sm rounded-lg text-center animate-in fade-in slide-in-from-top-1">{message}</div>}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="button" className="flex-1 px-8 py-4 border border-white/10 rounded-full text-[#aaa] font-bold hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider text-sm" onClick={onCancel}>← Back</button>
                <button disabled={isLoading || !stripe || !elements} id="submit" className="flex-[2] lime-btn !rounded-full">
                    {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : "Pay Now & Confirm Order"}
                </button>
            </div>
        </form>
    );
};

const CheckoutPage = () => {
    const { items, subtotal, deliveryFee, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1: Review, 2: Address, 3: Payment
    const [address, setAddress] = useState({ line1: '', line2: '', postcode: '', deliveryInstructions: '' });
    const [dynamicDeliveryFee, setDynamicDeliveryFee] = useState(3.99);
    const [postcodeStatus, setPostcodeStatus] = useState(null); // 'valid', 'inactive', 'invalid'
    const [processing, setProcessing] = useState(false);
    const [orderResult, setOrderResult] = useState(null);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentFinalized, setPaymentFinalized] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=checkout');
        }
    }, [user, navigate]);

    // Handle postcode changes to update delivery fee
    useEffect(() => {
        const checkPostcode = async () => {
            const raw = address.postcode.trim().toUpperCase();
            if (raw.length >= 2) {
                try {
                    const res = await fetch(`${API_BASE}/postcodes/check/${raw}`, { credentials: 'include' });
                    const data = await res.json();
                    if (data && data.code) {
                        setDynamicDeliveryFee(Number(data.deliveryFee || 3.99));
                        setPostcodeStatus(data.active ? 'valid' : 'inactive');
                    } else {
                        setDynamicDeliveryFee(3.99);
                        setPostcodeStatus('invalid');
                    }
                } catch (err) {
                    setDynamicDeliveryFee(3.99);
                    setPostcodeStatus('invalid');
                }
            } else {
                setPostcodeStatus(null);
            }
        };

        const timer = setTimeout(checkPostcode, 500);
        return () => clearTimeout(timer);
    }, [address.postcode]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentIntent = params.get('payment_intent');
        const paymentIntentClientSecret = params.get('payment_intent_client_secret');

        if (paymentIntent && paymentIntentClientSecret) {
            setPaymentFinalized(true);
            clearCart();
        }
    }, []);

    const adjustedTotal = subtotal + dynamicDeliveryFee;

    const handleInitiatePayment = async () => {
        setProcessing(true);
        try {
            const orderPayload = {
                subtotal, deliveryFee: dynamicDeliveryFee, totalAmount: adjustedTotal,
                items: {
                    create: items.map(i => ({
                        productId: i.product.id,
                        quantity: i.quantity,
                        priceAtTime: i.unitPrice,
                        weight: i.customisations.weight,
                        cutType: i.customisations.cutType,
                        fatPreference: i.customisations.fatPreference,
                        bonePreference: i.customisations.bonePreference,
                        packingStyle: i.customisations.packingStyle,
                        specialNotes: i.customisations.specialNotes,
                        texture: i.customisations.texture || null,
                        grind: i.customisations.grind || null,
                        mincedFatLevel: i.customisations.mincedFatLevel || null,
                    }))
                },
                address: { create: address },
                // Supplier assignment now happens backend-side based on proximity/Admin mapping.
            };

            const headers = { 'Content-Type': 'application/json' };

            const res = await fetch(`${API_BASE}/orders`, { 
                method: 'POST', 
                credentials: 'include',
                headers, 
                body: JSON.stringify(orderPayload) 
            });
            const data = await res.json();
            
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setOrderResult(data);
                setStep(3);
            }
        } catch (err) {
            console.error("Order initiation error:", err);
        }
        setProcessing(false);
    };

    const handlePaymentSuccess = () => {
        clearCart();
        navigate(`/checkout/success?order_id=${orderResult?.id || ''}`);
    };

    if (paymentFinalized) {
        return (
            <section className="pt-[140px] pb-[100px] bg-[#f8f9fa] min-h-screen text-[#1a1a1a] flex items-center">
                <div className="teza-container">
                    <div className="max-w-[600px] mx-auto text-center bg-white border border-black/5 rounded-3xl p-10 shadow-2xl transition-all">
                        <div className="w-20 h-20 bg-accent-lime rounded-full flex items-center justify-center text-black text-4xl font-bold mx-auto mb-8 shadow-[0_10px_30px_rgba(186,205,56,0.3)]">✓</div>
                        <h1 className="text-4xl font-extrabold mb-4 italic tracking-tighter">Order Confirmed!</h1>
                        <p className="text-[#666] mb-2">Your order <strong className="text-black">#{orderResult?.orderNumber}</strong> has been secured.</p>
                        <p className="text-[#888] text-sm mb-10">You'll receive SMS updates as your order progresses.</p>
                        <button className="lime-btn w-full" onClick={() => navigate(`/orders/${orderResult?.id}`)}>Track Order</button>
                    </div>
                </div>
            </section>
        );
    }

    if (items.length === 0 && !orderResult) {
        return (
            <section className="pt-[140px] pb-[100px] bg-[#f8f9fa] min-h-screen text-[#1a1a1a] flex items-center">
                <div className="teza-container text-center">
                    <h1 className="text-4xl font-extrabold mb-6 italic tracking-tighter">Your Cart is Empty</h1>
                    <p className="text-[#666] mb-10 font-medium">Browse our products and add some premium cuts to your collection.</p>
                    <button className="lime-btn px-10" onClick={() => navigate('/products')}>Browse Products</button>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-[140px] pb-[100px] bg-[#f8f9fa] min-h-screen text-[#1a1a1a]">
            <div className="teza-container">
                <div className="flex justify-center gap-10 lg:gap-20 mb-16 overflow-x-auto pb-4 no-scrollbar">
                    {['Review', 'Delivery', 'Payment'].map((label, i) => (
                        <div key={label} className={`flex items-center gap-3 whitespace-nowrap transition-all duration-300 ${step > i ? 'text-accent-lime opacity-100' : step === i + 1 ? 'text-[#1a1a1a] opacity-100' : 'text-[#999] opacity-50'}`}>
                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step > i ? 'bg-accent-lime border-accent-lime text-black shadow-lg shadow-accent-lime/20' : step === i + 1 ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#ccc]'}`}>{i + 1}</span>
                            <span className="font-bold tracking-wider uppercase text-xs lg:text-sm">{label}</span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="max-w-[800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-extrabold mb-8 italic tracking-tighter uppercase">Review Your Selection</h2>
                        <div className="space-y-4 mb-8">
                            {items.map(item => (
                                <div key={item.id} className="bg-white border border-black/5 p-6 rounded-2xl flex justify-between items-center shadow-xl">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-[#1a1a1a]">{item.product.name}</h3>
                                        <div className="flex gap-4 text-xs font-bold text-[#999] uppercase tracking-wider">
                                            <span>{item.customisations.weight}</span>
                                            <span className="opacity-20">|</span>
                                            <span>{item.customisations.cutType}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[#999] text-sm mb-1 font-bold">×{item.quantity}</div>
                                        <div className="text-xl font-extrabold text-[#1a1a1a]">£{(item.unitPrice * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white border border-black/5 rounded-2xl p-8 mb-8 shadow-sm">
                            <div className="flex justify-between mb-2 text-2xl font-black italic tracking-tighter uppercase">
                                <span>Subtotal</span>
                                <span>£{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 border-t border-black/5 text-[10px] font-black text-[#999] uppercase tracking-widest text-center">
                                Delivery fee will be calculated based on your address in the next step
                            </div>
                        </div>
                        <button className="lime-btn w-full !h-16 !text-lg rounded-2xl! shadow-[0_10px_30px_rgba(186,205,56,0.3)]" onClick={() => setStep(2)}>
                            Next: Delivery Details →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-extrabold mb-8 italic tracking-tighter uppercase">Delivery Destination</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white border border-black/5 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 italic tracking-tighter uppercase">Shipping Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-[#999] uppercase tracking-[0.2em] mb-2">Address Line 1 *</label>
                                        <input className="w-full bg-[#f8f9fa] border border-black/5 p-4 rounded-xl text-[#1a1a1a] outline-none focus:border-accent-lime transition-all focus:bg-white" placeholder="123 Butcher Lane" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[#999] uppercase tracking-[0.2em] mb-2">Address Line 2 (Optional)</label>
                                        <input className="w-full bg-[#f8f9fa] border border-black/5 p-4 rounded-xl text-[#1a1a1a] outline-none focus:border-accent-lime transition-all focus:bg-white" placeholder="Flat 4b" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[#999] uppercase tracking-[0.2em] mb-2">Postcode *</label>
                                        <input className="w-full bg-[#f8f9fa] border border-black/5 p-4 rounded-xl text-[#1a1a1a] outline-none focus:border-accent-lime transition-all focus:bg-white uppercase" placeholder="E1 6AN" value={address.postcode} onChange={e => setAddress({ ...address, postcode: e.target.value })} />
                                        {postcodeStatus === 'inactive' && <p className="text-[10px] text-orange-500 font-bold uppercase mt-2 tracking-widest animate-pulse">Notice: Area is currently limited coverage.</p>}
                                        {postcodeStatus === 'invalid' && <p className="text-[10px] text-red-500 font-bold uppercase mt-2 tracking-widest">Postcode not recognized for delivery.</p>}
                                        {postcodeStatus === 'valid' && <p className="text-[10px] text-accent-lime font-bold uppercase mt-2 tracking-widest">Serviceable Area ✓</p>}
                                        {!postcodeStatus && <p className="text-[10px] text-[#999] font-bold uppercase mt-2 tracking-widest">Fee updates when postcode is entered</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-[#999] uppercase tracking-[0.2em] mb-2">Driver Instructions</label>
                                        <textarea 
                                            className="w-full bg-[#f8f9fa] border border-black/5 p-4 rounded-xl text-[#1a1a1a] outline-none focus:border-accent-lime transition-all focus:bg-white min-h-[100px]" 
                                            placeholder="Notes for the driver (e.g. Leave in porch)" 
                                            value={address.deliveryInstructions} 
                                            onChange={e => setAddress({ ...address, deliveryInstructions: e.target.value })} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm h-full flex flex-col">
                                    <h3 className="text-xl font-bold mb-6 italic tracking-tighter uppercase">Current Bill</h3>
                                    <div className="space-y-4 mb-8 flex-1">
                                        <div className="flex justify-between text-[#666] font-semibold text-sm"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-[#666] font-semibold text-sm"><span>Delivery Fee</span><span>£{dynamicDeliveryFee.toFixed(2)}</span></div>
                                        <div className="flex justify-between pt-6 border-t border-black/10 text-2xl font-black italic tracking-tighter"><span>Order Total</span><span className="text-black">£{adjustedTotal.toFixed(2)}</span></div>
                                    </div>
                                    <div className="space-y-4 mt-auto">
                                        <button className="lime-btn w-full !rounded-2xl shadow-[0_10px_30px_rgba(186,205,56,0.3)] disabled:opacity-50 disabled:grayscale" onClick={handleInitiatePayment} disabled={processing || !address.line1 || !address.postcode}>
                                            {processing ? 'Initializing...' : 'Proceed to Payment →'}
                                        </button>
                                        <button className="w-full text-[10px] font-black text-[#999] uppercase tracking-widest hover:text-[#1a1a1a] transition-colors" onClick={() => setStep(1)}>← Back to Review</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && clientSecret && (
                    <div className="max-w-[1000px] mx-auto animate-in fade-in zoom-in duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div>
                                <h2 className="text-3xl font-extrabold mb-8 italic tracking-tighter uppercase">Secure Checkout</h2>
                                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-2xl">
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm 
                                            clientSecret={clientSecret} 
                                            onCancel={() => setStep(2)} 
                                            onSuccess={handlePaymentSuccess}
                                        />
                                    </Elements>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-black text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-lime opacity-10 blur-[80px]"></div>
                                    <h3 className="text-xl font-bold mb-8 italic tracking-tighter uppercase text-accent-lime">Final Summary</h3>
                                    <div className="space-y-4 font-bold uppercase tracking-widest text-xs">
                                        <div className="flex justify-between opacity-50"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
                                        <div className="flex justify-between opacity-50"><span>Delivery ({address.postcode})</span><span>£{dynamicDeliveryFee.toFixed(2)}</span></div>
                                        <div className="flex justify-between pt-8 border-t border-white/10 text-3xl font-black italic text-accent-lime tracking-tighter"><span>Grand Total</span><span>£{adjustedTotal.toFixed(2)}</span></div>
                                    </div>
                                    <div className="mt-12 pt-8 border-t border-white/5">
                                        <div className="text-[10px] text-accent-lime opacity-50 mb-3 tracking-widest">SHIPPING TO:</div>
                                        <div className="text-sm leading-relaxed text-white/80">{address.line1}<br/>{address.postcode}</div>
                                    </div>
                                </div>
                                <div className="p-6 bg-white/50 border border-black/5 rounded-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent-lime/10 flex items-center justify-center text-accent-lime">🔒</div>
                                    <p className="text-[10px] font-bold text-[#666] uppercase leading-relaxed tracking-wider">Your personal and payment data is encrypted and secure.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CheckoutPage;
