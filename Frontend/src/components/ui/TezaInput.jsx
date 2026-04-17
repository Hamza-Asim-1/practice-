import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * TezaInput: A premium, architectural input component.
 * @param {LucideIcon} icon - Optional icon to display.
 * @param {string} type - Input type (text, password, email, etc.).
 * @param {boolean} skewed - Whether to apply the signature Teza skew effect.
 * @param {string} error - Error message to display.
 */
const TezaInput = ({ 
    icon: Icon, 
    type = 'text', 
    placeholder, 
    value, 
    onChange, 
    error, 
    name,
    className = "",
    skewed = true,
    autoComplete
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`relative group/input ${className}`}>
            {/* Geometric Accent Lines */}
            <div className={`absolute -left-4 -top-4 w-8 h-8 border-l border-t border-black/5 group-focus-within/input:border-accent-lime transition-colors duration-500`}></div>
            
            <div className={`
                flex items-center gap-4 bg-black/5 p-4 border border-black/5 
                group-focus-within/input:bg-black/[0.08] group-focus-within/input:border-black/10 
                transition-all duration-500
                ${skewed ? '-skew-x-12' : ''}
            `}>
                {Icon && (
                    <Icon 
                        size={18} 
                        className={`text-black/20 transition-colors duration-500 ${skewed ? 'skew-x-12' : ''} group-focus-within/input:text-accent-lime`} 
                    />
                )}
                
                <input 
                    type={inputType} 
                    name={name}
                    placeholder={placeholder} 
                    value={value} 
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className={`
                        bg-transparent w-full text-black text-xs font-black uppercase tracking-widest outline-none 
                        placeholder:text-black/20
                        ${skewed ? 'skew-x-12' : ''}
                    `}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`text-black/20 hover:text-black transition-colors p-1 ${skewed ? 'skew-x-12' : ''}`}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>

            {/* Error Message - Inside Flow to prevent clipping */}
            <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-10 mt-2 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
                <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] animate-in slide-in-from-top-1 px-4">
                    {error}
                </div>
            </div>
        </div>
    );
};

export default TezaInput;
