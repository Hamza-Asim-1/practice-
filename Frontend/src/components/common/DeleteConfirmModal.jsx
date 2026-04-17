import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/10 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-black text-text-cream mb-2">
                        {title || 'Confirm Deletion'}
                    </h3>
                    <p className="text-black/60 text-sm font-medium leading-relaxed mb-8">
                        {message || 'Are you sure you want to remove this item? This action cannot be undone and may affect related data.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-xl bg-black/5 text-black/40 text-xs font-black uppercase tracking-widest hover:bg-black/10 hover:text-black transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            {isLoading ? 'Removing...' : 'Confirm Purge'}
                        </button>
                    </div>
                </div>
                
                {/* Visual Accent */}
                <div className="h-1.5 w-full bg-red-500/10">
                    <div className="h-full bg-red-500 animate-progress" style={{ width: isLoading ? '100%' : '0%' }} />
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
