import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlobalLoader from '../common/GlobalLoader';

/**
 * RoleGuard
 * ─────────────────────────────────────────────────────────────────────────────
 * A declarative component to protect routes based on authentication status
 * and user roles (e.g., ADMIN, SUPPLIER).
 * 
 * @param {string|string[]} allowedRoles - Roles permitted to access the children.
 * @param {React.ReactNode} children - The component(s) to render if authorized.
 */
const RoleGuard = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // 1. Session Hydration: Show global loader while checking session
    if (loading) {
        return <GlobalLoader />;
    }

    // 2. Not Authenticated: Redirect to login with current location for redirection back
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Unauthorized: If user role is not in allowed roles
    if (allowedRoles && allowedRoles.length > 0) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        const hasPermission = roles.includes(user.role?.toUpperCase());

        if (!hasPermission) {
            // Log for security auditing (or send to monitoring service)
            console.warn(`[Security] Unauthorized access attempt by ${user.email} to ${location.pathname}`);
            
            // Redirect to a neutral safe spot (home) or a 403 Forbidden page
            return <Navigate to="/" replace />;
        }

        // 3.5 Status Check: Suppliers must be APPROVED to access their dashboard
        if (user.role?.toUpperCase() === 'SUPPLIER_ADMIN' && user.supplier?.status === 'PENDING' && !location.pathname.includes('/supplier/pending')) {
            return <Navigate to="/supplier/pending" replace />;
        }
    }

    // 4. Authorized: Render the children
    return children;
};

export default RoleGuard;
