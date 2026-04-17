import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const toggleCart = () => setIsCartOpen(prev => !prev);
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const addItem = (product, customisations, quantity = 1) => {
        const newItem = {
            id: Date.now(),
            product,
            customisations,
            quantity,
            unitPrice: Number(product.basePrice) + (customisations.extraCost || 0),
        };
        setItems(prev => [...prev, newItem]);
    };

    const removeItem = (itemId) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    };

    const clearCart = () => setItems([]);

    const subtotal = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
    const deliveryFee = items.length > 0 ? 3.99 : 0;
    const total = subtotal + deliveryFee;

    return (
        <CartContext.Provider value={{ 
            items, addItem, removeItem, updateQuantity, clearCart, 
            subtotal, deliveryFee, total,
            isCartOpen, toggleCart, openCart, closeCart 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
