import React, { useState } from 'react';
import { Plus, X, List, Hash } from 'lucide-react';

const SpecificationsManager = ({ specifications = {}, onChange, theme = 'light', compact = false }) => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [activeInlineKey, setActiveInlineKey] = useState(null);
    const [inlineValue, setInlineValue] = useState('');

    // Normalize incoming specs to { Key: [Values] }
    const getNormalizedSpecs = () => {
        if (!specifications || typeof specifications !== 'object') return {};
        if (Array.isArray(specifications)) {
            return specifications.reduce((acc, spec) => {
                const key = spec.key || spec.label;
                if (!key) return acc;
                if (!acc[key]) acc[key] = [];
                acc[key].push(spec.value);
                return acc;
            }, {});
        }
        // If already object, ensure values are arrays
        const normalized = {};
        Object.entries(specifications).forEach(([key, values]) => {
            normalized[key] = Array.isArray(values) ? values : [String(values)];
        });
        return normalized;
    };

    const specs = getNormalizedSpecs();

    const handleAddMain = () => {
        if (!newKey.trim() || !newValue.trim()) return;
        const normalizedKey = newKey.trim();
        const updated = { ...specs };
        if (!updated[normalizedKey]) updated[normalizedKey] = [];
        updated[normalizedKey].push(newValue.trim());
        onChange(updated);
        setNewValue(''); // Keep key to allow rapid entry
    };

    const handleAddInline = (key) => {
        if (!inlineValue.trim()) return;
        const updated = { ...specs };
        if (!updated[key]) updated[key] = [];
        updated[key].push(inlineValue.trim());
        onChange(updated);
        setInlineValue('');
        setActiveInlineKey(null);
    };

    const handleRemoveValue = (key, index) => {
        const updated = { ...specs };
        updated[key] = updated[key].filter((_, i) => i !== index);
        if (updated[key].length === 0) delete updated[key];
        onChange(updated);
    };

    const handleRemoveKey = (key) => {
        const updated = { ...specs };
        delete updated[key];
        onChange(updated);
    };

    const styles = theme === 'light' ? {
        textHeader: 'text-black/40',
        bgCard: 'bg-black/5',
        borderCard: 'border-black/5 hover:border-black/10',
        textKey: 'text-black/50',
        btnRemove: 'text-black/20 hover:text-red-500',
        bgTag: 'bg-white border-black/10 hover:border-accent-lime/50',
        textTag: 'text-black',
        btnTagRemove: 'bg-black/5 text-black/40 hover:bg-red-500 hover:text-white',
        inlineAddWrap: 'bg-white border-accent-lime/50',
        inputBg: 'bg-transparent border-none text-black placeholder:text-black/30',
        btnAddInline: 'text-black/40 hover:border-accent-lime border border-dashed border-black/10 text-[10px]',
        bgMainForm: 'bg-[#f8f9fa] border-black/5',
        textMainLabel: 'text-black/40',
        mainInput: 'bg-white border-black/10 text-black focus:border-black placeholder:text-black/20',
        textMainHeader: 'text-black'
    } : {
        textHeader: 'text-white/50',
        bgCard: 'bg-white/2',
        borderCard: 'border-white/5 hover:border-white/10',
        textKey: 'text-white/40',
        btnRemove: 'text-white/10 hover:text-red-500',
        bgTag: 'bg-white/5 border-white/10 hover:border-accent-lime/30',
        textTag: 'text-white',
        btnTagRemove: 'bg-white/5 text-white/30 hover:bg-red-500 hover:text-white',
        inlineAddWrap: 'bg-white/5 border-accent-lime/30',
        inputBg: 'bg-transparent border-none text-white placeholder:text-white/10',
        btnAddInline: 'text-white/20 hover:border-accent-lime/50 hover:text-accent-lime border border-dashed border-white/10 text-[10px]',
        bgMainForm: 'bg-black/20 border-white/5',
        textMainLabel: 'text-white/20',
        mainInput: 'bg-white/2 border-white/5 text-white focus:border-white/10 placeholder:text-white/5',
        textMainHeader: 'text-white'
    };

    return (
        <div className={compact ? "space-y-4" : "space-y-6"}>
            {!compact && (
                <div className="flex items-center gap-2 mb-2">
                    <List size={14} className="text-accent-lime" />
                    <h4 className={`text-[10px] font-black uppercase tracking-widest ${styles.textHeader}`}>Technical Specifications</h4>
                </div>
            )}

            {/* List grouped specs */}
            <div className="space-y-4">
                {Object.keys(specs).sort().map((key) => (
                    <div key={key} className={`${styles.bgCard} border ${styles.borderCard} rounded-2xl p-5 group transition-all`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${styles.textKey}`}>{key}</span>
                            <button 
                                type="button"
                                onClick={() => handleRemoveKey(key)}
                                className={`${styles.btnRemove} transition-colors`}
                            >
                                <X size={12} />
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {specs[key].map((val, idx) => (
                                <div key={idx} className={`flex items-center gap-2 ${styles.bgTag} border rounded-lg pl-3 pr-2 py-1.5 group/tag transition-all`}>
                                    <span className={`text-xs font-bold ${styles.textTag}`}>{val}</span>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveValue(key, idx)}
                                        className={`w-5 h-5 rounded-md flex items-center justify-center ${styles.btnTagRemove} transition-all`}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}

                            {activeInlineKey === key ? (
                                <div className={`flex items-center gap-1 ${styles.inlineAddWrap} border rounded-lg p-1 animate-in slide-in-from-left-2 duration-200`}>
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Add value..."
                                        className={`${styles.inputBg} text-xs font-bold outline-none px-2 w-24`}
                                        value={inlineValue}
                                        onChange={(e) => setInlineValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); handleAddInline(key); }
                                            if (e.key === 'Escape') setActiveInlineKey(null);
                                        }}
                                        onBlur={() => !inlineValue.trim() && setActiveInlineKey(null)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => handleAddInline(key)}
                                        className="w-6 h-6 rounded-md bg-accent-lime text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => setActiveInlineKey(key)}
                                    className={`h-8 px-3 rounded-lg flex items-center justify-center gap-2 transition-all font-black uppercase tracking-widest ${styles.btnAddInline}`}
                                >
                                    <Plus size={12} /> Add
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Entry Form (New Category) */}
            <div className={`${styles.bgMainForm} border rounded-3xl ${compact ? 'p-4' : 'p-6'} space-y-4 transition-colors`}>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-accent-lime/10 flex items-center justify-center">
                        <Plus size={12} className="text-accent-lime" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.textMainHeader}`}>Add New Specification</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className={`text-[8px] font-black uppercase tracking-widest ${styles.textMainLabel} ml-1`}>Label</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Size"
                            className={`w-full rounded-2xl px-5 py-3.5 text-xs font-bold outline-none border transition-all ${styles.mainInput}`}
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className={`text-[8px] font-black uppercase tracking-widest ${styles.textMainLabel} ml-1`}>Initial Value</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                placeholder="e.g. Small"
                                className={`w-full rounded-2xl px-5 py-3.5 text-xs font-bold outline-none border transition-all ${styles.mainInput}`}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMain())}
                            />
                            <button 
                                type="button"
                                onClick={handleAddMain}
                                disabled={!newKey.trim() || !newValue.trim()}
                                className="w-12 h-12 shrink-0 rounded-2xl bg-accent-lime text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed shadow-xl shadow-accent-lime/10"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecificationsManager;
