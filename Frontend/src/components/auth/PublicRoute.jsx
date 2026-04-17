import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PublicRoute restricts access to pages (like Login/Register)
 * so that already-authenticated users are redirected away.
 */
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // While checking auth status, we don't redirect
    if (loading) return null;

    if (user) {
        // If user is logged in, redirect them based on their role
        // Admin/Ops -> Admin Dashboard
        // Supplier -> Supplier Dashboard
        // Customer -> Home or intended destination
        
        if (user.role === 'SUPER_ADMIN' || user.role === 'OPS_ADMIN') {
            return <Navigate to="/admin" replace />;
        }
        
        if (user.role === 'SUPPLIER_ADMIN') {
            if (user.status === 'PENDING') {
                return <Navigate to="/supplier/pending" replace />;
            }
            return <Navigate to="/supplier" replace />;
        }

        // Default for customers
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PublicRoute;
