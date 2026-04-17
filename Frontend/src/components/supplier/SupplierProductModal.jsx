import React, { useState, useEffect, useRef } from 'react';
import { 
    Tag, 
    X, 
    ChevronRight, 
    Package, 
    Info, 
    Upload, 
    ShieldCheck, 
    ShieldAlert, 
    Activity, 
    FileText, 
    Loader2, 
    Globe, 
    Link as LinkIcon,
    List
} from 'lucide-react';
import toast from 'react-hot-toast';
import SpecificationsManager from '../admin/SpecificationsManager';

export default function SupplierProductModal({ product, isSubmitting, onClose, onSave }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadMode, setUploadMode] = useState('UPLOAD'); // 'UPLOAD' or 'LINK'
    const fileInputRef = useRef(null);
    
    const [form, setForm] = useState({ 
        name: '', 
        category: 'BEEF', 
        basePrice: '', 
        description: '',
        imageUrl: '',
        isHmcCertified: true,
        status: 'LIVE',
        quantity: '0',
        lowStockThreshold: '5',
        specifications: {}
    });

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || '',
                category: product.category || 'BEEF',
                basePrice: String(product.basePrice) || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                isHmcCertified: product.isHmcCertified ?? true,
                status: product.status || 'LIVE',
                quantity: String(product.stock?.quantity || 0),
                lowStockThreshold: String(product.stock?.lowStockThreshold || 5),
                specifications: product.specifications || {}
            });
            if (product.imageUrl) setPreviewUrl(product.imageUrl);
        }
    }, [product]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Strict Protocol Check: Only PNG, JPG, JPEG are permitted
        const validExtensions = ['image/png', 'image/jpeg', 'image/jpg'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const isAllowedExtension = ['png', 'jpg', 'jpeg'].includes(fileExtension);

        if (!validExtensions.includes(file.type) || !isAllowedExtension) {
            toast.error('Invalid Protocol: Only PNG, JPG, and JPEG assets are accepted.');
            e.target.value = ''; // Reset input
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setUploadMode('UPLOAD');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (Number(form.basePrice) <= 0) {
            toast.error('Valuation must be a positive decimal.');
            return;
        }
        if (Number(form.quantity) < 0) {
            toast.error('Inventory quantity cannot be negative.');
            return;
        }

        // Check if image is required (at least one source)
        if (!selectedFile && !form.imageUrl && uploadMode === 'UPLOAD') {
            toast.error('Please upload an asset or provide a source link.');
            return;
        }

        // We pass the actual File object along for backend processing
        onSave({
            ...form,
            basePrice: Number(form.basePrice),
            stock: {
                quantity: Number(form.quantity),
                lowStockThreshold: Number(form.lowStockThreshold)
            },
            specifications: form.specifications,
            file: selectedFile
        });
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white rounded-4xl w-full max-w-2xl relative z-101 animate-in zoom-in duration-300 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter text-black m-0">
                                Edit Product
                            </h3>
                            <div className="text-[10px] font-black uppercase tracking-widest text-black/20">Update your product details</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
                        <X size={20} className="text-black/20" />
                    </button>
                </div>



                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-8 overflow-y-auto custom-scrollbar">
                    
                    {/* section: primary identification */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={14} className="text-black/20" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Basic Details</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Product Name</label>
                                <input 
                                    className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all placeholder:text-black/10" 
                                    value={form.name} 
                                    placeholder="e.g. Wagyu Ribeye A5"
                                    onChange={e => setForm({ ...form, name: e.target.value })} 
                                    required 
                                />
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Category</label>
                                <select 
                                    className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all appearance-none cursor-pointer" 
                                    value={form.category} 
                                    onChange={e => setForm({ ...form, category: e.target.value })}
                                >
                                    <option>BEEF</option>
                                    <option>LAMB</option>
                                    <option>POULTRY</option>
                                    <option>VEAL</option>
                                    <option>GOAT</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Base Price (£)</label>
                                <input 
                                    className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all" 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    value={form.basePrice} 
                                    onChange={e => setForm({ ...form, basePrice: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* section: inventory & logistics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={14} className="text-black/20" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Inventory & Certification</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Total Stock (Kg/Unit)</label>
                                <input 
                                    className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all" 
                                    type="number" 
                                    step="0.1" 
                                    value={form.quantity} 
                                    onChange={e => setForm({ ...form, quantity: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Low Stock Threshold</label>
                                <input 
                                    className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all" 
                                    type="number" 
                                    value={form.lowStockThreshold} 
                                    onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2 block">Visibility</label>
                                <select 
                                    className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all appearance-none cursor-pointer" 
                                    value={form.status} 
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option value="LIVE">LIVE (VISIBLE)</option>
                                    <option value="HIDDEN">HIDDEN (ARCHIVED)</option>
                                </select>
                            </div>
                        </div>

                        <div 
                            onClick={() => setForm({ ...form, isHmcCertified: !form.isHmcCertified })}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${form.isHmcCertified ? 'bg-accent-lime/10 border-accent-lime/30' : 'bg-red-50/10 border-red-500/20 grayscale'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.isHmcCertified ? 'bg-accent-lime text-black' : 'bg-red-500 text-white'}`}>
                                    {form.isHmcCertified ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider">HMC Certification</div>
                                    <div className="text-[10px] text-black/40 font-bold">Is this product HMC Certified?</div>
                                </div>
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${form.isHmcCertified ? 'bg-accent-lime/20 text-accent-lime border-accent-lime/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {form.isHmcCertified ? 'YES' : 'NO'}
                            </div>
                        </div>
                    </div>

                    {/* section: media & assets */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-black/20" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Product Image</span>
                            </div>
                            <div className="flex bg-[#f8f9fa] rounded-lg p-1 border border-black/5">
                                <button type="button" onClick={() => setUploadMode('UPLOAD')} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${uploadMode === 'UPLOAD' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}>Upload File</button>
                                <button type="button" onClick={() => setUploadMode('LINK')} className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all ${uploadMode === 'LINK' ? 'bg-black text-white' : 'text-black/40 hover:text-black'}`}>Image URL</button>
                            </div>
                        </div>

                        <div className="bg-[#f8f9fa] border border-dashed border-black/10 rounded-2xl overflow-hidden min-h-[160px] flex flex-col items-center justify-center p-6 relative group transition-all hover:bg-black/2">
                            {previewUrl ? (
                                <div className="absolute inset-0 group">
                                    <img src={previewUrl} className="w-full h-full object-cover opacity-30 group-hover:opacity-10 transition-opacity" alt="Preview" />
                                    <div className="absolute inset-0 flex items-center justify-center flex-col opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-2xl mb-3">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-lg">Replace Image</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { setSelectedFile(null); setPreviewUrl(''); setForm(prev => ({ ...prev, imageUrl: '' })); }}
                                        className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg transform translate-x-12 group-hover:translate-x-0 transition-transform"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : null}

                            {!previewUrl && uploadMode === 'UPLOAD' && (
                                <>
                                    <div className="w-14 h-14 rounded-full bg-white border border-black/5 flex items-center justify-center mb-4 shadow-sm">
                                        <Upload size={24} className="text-black/20" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-1">Upload an image</p>
                                    <p className="text-[9px] text-black/20 font-bold underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>Browse Files</p>
                                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </>
                            )}

                            {!previewUrl && uploadMode === 'LINK' && (
                                <div className="w-full max-w-sm flex items-center gap-3 bg-white p-2 rounded-xl border border-black/10">
                                    <div className="w-10 h-10 shrink-0 bg-black/5 flex items-center justify-center rounded-lg">
                                        <LinkIcon size={16} className="text-black/40" />
                                    </div>
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-black/20" 
                                        placeholder="Paste image URL..."
                                        value={form.imageUrl}
                                        onChange={e => { setForm({ ...form, imageUrl: e.target.value }); setPreviewUrl(e.target.value); }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* section: custom specifications */}
                    <div className="space-y-6">
                        <SpecificationsManager 
                            specifications={form.specifications}
                            theme="light"
                            onChange={(specs) => setForm(prev => ({ ...prev, specifications: specs }))}
                        />
                    </div>

                    {/* section: narrative */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Tag size={14} className="text-black/20" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Product Description</span>
                        </div>
                        <textarea 
                            rows={3}
                            className="w-full bg-[#f8f9fa] border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold focus:border-black outline-none transition-all placeholder:text-black/10 resize-none" 
                            value={form.description} 
                            placeholder="Detail the cut, origin, or preparation requirements..."
                            onChange={e => setForm({ ...form, description: e.target.value })} 
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button disabled={isSubmitting} type="submit" className="flex-1 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[4px] shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all group flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Saving changes...' : 'Save Changes'}
                            {!isSubmitting && <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
