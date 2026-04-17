import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE;

const PostcodeChecker = () => {
    const [postcode, setPostcode] = useState('');
    const [result, setResult] = useState(null); // { type: 'success' | 'error', message: string, data?: any }
    const [loading, setLoading] = useState(false);

    const checkCoverage = async (e) => {
        e.preventDefault();
        if (!postcode) return;

        setLoading(true);
        setResult(null);

        try {
            const formattedCode = postcode.replace(/\s+/g, '').toUpperCase();
            const res = await fetch(`${API_BASE}/postcodes/check/${formattedCode}`);
            const data = await res.json();

            if (res.ok) {
                setResult({
                    type: 'success',
                    message: `Great news! We deliver to ${data.code}.`,
                    data: data
                });
            } else {
                setResult({
                    type: 'error',
                    message: data.message || 'Delivery is not currently available in this area.'
                });
            }
        } catch (error) {
            setResult({
                type: 'error',
                message: 'Unable to check delivery status right now. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#141416]/85 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8 max-w-[480px]">
            <h3 className="text-white text-base font-bold mb-1.5">Check Delivery Availability</h3>
            <p className="text-[#a0a0a0] text-[12px] mb-4 leading-tight">Enter your postcode to see if we deliver premium beef to your area.</p>

            <form onSubmit={checkCoverage} className="flex gap-2 mb-4">
                <input
                    type="text"
                    className="flex-1 bg-black/50 border border-white/15 text-white p-3 px-4 rounded-md text-sm outline-none transition-all focus:border-accent-lime focus:ring-2 focus:ring-accent-lime/10 uppercase placeholder:text-[#555] placeholder:normal-case"
                    placeholder="e.g. SW1A 1AA"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    className="lime-btn px-6! py-0! h-[46px]! rounded-md! text-[13px] whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed" 
                    disabled={loading}
                >
                    {loading ? 'CHECKING...' : 'CHECK'}
                </button>
            </form>

            {result && (
                <div className={`p-3 px-4 rounded-md text-[13px] animate-in fade-in duration-300 ${
                    result.type === 'success' 
                    ? 'bg-accent-lime/10 border border-accent-lime/20 text-accent-lime' 
                    : 'bg-[#eb5757]/10 border border-[#eb5757]/20 text-[#ff6b6b]'
                }`}>
                    <p className="font-bold">{result.message}</p>
                    {result.type === 'success' && result.data && (
                        <div className="flex gap-4 mt-2 text-[11px] text-white/90">
                            <span>Delivery Charge: £{Number(result.data.deliveryFee).toFixed(2)}</span>
                            <span>Min. Order: £{Number(result.data.minimumOrder).toFixed(2)}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostcodeChecker;
