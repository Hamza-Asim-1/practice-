import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import GlobalLoader from './components/common/GlobalLoader';
import ScrollToHash from './components/common/ScrollToHash';

import Navbar      from './components/layout/Navbar';
import Footer      from './components/layout/Footer';
import CartSidebar from './components/layout/CartSidebar';
import CustomerLayout from './components/layout/CustomerLayout';

/* Pages — Customer */
import HomePage         from './pages/HomePage';
import CataloguePage    from './pages/CataloguePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage     from './pages/CheckoutPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import MyOrdersPage     from './pages/MyOrdersPage';
import AccountPage      from './pages/AccountPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderCancelPage  from './pages/OrderCancelPage';
import NotFoundPage     from './pages/NotFoundPage';

/* Pages — Supplier */
import SupplierLogin           from './pages/supplier/SupplierLogin';
import SupplierOrdersPage      from './pages/supplier/SupplierOrdersPage';
import SupplierOrderDetailPage from './pages/supplier/SupplierOrderDetailPage';

/* Pages — Admin */
import AdminLayout         from './components/admin/AdminLayout';
import AdminDashboardPage  from './pages/admin/AdminDashboardPage';
import AdminOrdersPage     from './pages/admin/AdminOrdersPage';
import AdminProductsPage   from './pages/admin/AdminProductsPage';
import AdminSuppliersPage  from './pages/admin/AdminSuppliersPage';
import AdminCustomersPage  from './pages/admin/AdminCustomersPage';
import AdminPostcodesPage  from './pages/admin/AdminPostcodesPage';
import AdminUsersPage      from './pages/admin/AdminUsersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AdminSupplierDetailsPage from './pages/admin/AdminSupplierDetailsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminLoginPage      from './pages/admin/AdminLoginPage';
import SupplierOverviewPage from './pages/supplier/SupplierOverviewPage';
import SupplierDashboardPage from './pages/supplier/SupplierDashboardPage';
import SupplierPendingPage  from './pages/supplier/SupplierPendingPage';

/* Components — Auth & Resilience */
import RoleGuard from './components/auth/RoleGuard';
import PublicRoute from './components/auth/PublicRoute';
import AppErrorBoundary from './components/common/AppErrorBoundary';


/* ─────────────────────────────────────────────────────────────────────────────
   App
───────────────────────────────────────────────────────────────────────────── */
function AppContent() {
    const { loading } = useAuth();
    const [showSplash, setShowSplash] = React.useState(true);

    React.useEffect(() => {
        if (!loading) {
            // Ensure minimum splash time for better UX
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [loading]);
    
    // Global resilience: Wrap entire app content in an Error Boundary
    return (
        (loading || showSplash) ? (
            <GlobalLoader />
        ) : (
                <BrowserRouter>
                    <Toaster position="top-center" reverseOrder={false} />
                    <ScrollToHash />
                    <CartSidebar />
                    <Routes>
                {/* ── Customer routes ─────────────────────────── */}
                <Route path="/"                element={<CustomerLayout><HomePage /></CustomerLayout>} />
                <Route path="/products"        element={<CustomerLayout><CataloguePage /></CustomerLayout>} />
                <Route path="/products/:id"    element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
                <Route path="/checkout"        element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
                <Route path="/checkout/success" element={<CustomerLayout><OrderSuccessPage /></CustomerLayout>} />
                <Route path="/checkout/cancel" element={<CustomerLayout><OrderCancelPage /></CustomerLayout>} />
                <Route path="/login"           element={<PublicRoute><CustomerLayout><LoginPage /></CustomerLayout></PublicRoute>} />
                <Route path="/register"        element={<PublicRoute><CustomerLayout><RegisterPage /></CustomerLayout></PublicRoute>} />
                <Route path="/orders/:id"      element={<CustomerLayout><OrderTrackingPage /></CustomerLayout>} />
                <Route path="/account/orders"  element={
                    <RoleGuard allowedRoles={['CUSTOMER', 'SUPER_ADMIN', 'OPS_ADMIN']}>
                        <CustomerLayout><MyOrdersPage /></CustomerLayout>
                    </RoleGuard>
                } />
                <Route path="/account"         element={
                    <RoleGuard allowedRoles={['CUSTOMER', 'SUPER_ADMIN', 'OPS_ADMIN']}>
                        <CustomerLayout><AccountPage /></CustomerLayout>
                    </RoleGuard>
                } />

                {/* ── Supplier routes (no CustomerLayout) ─────── */}
                <Route path="/supplier/login"       element={<PublicRoute><SupplierLogin /></PublicRoute>} />
                <Route path="/supplier/pending"     element={<SupplierPendingPage />} />
                <Route path="/supplier/dashboard"   element={
                    <RoleGuard allowedRoles={['SUPPLIER_ADMIN', 'SUPER_ADMIN']}>
                        <SupplierOverviewPage />
                    </RoleGuard>
                } />
                <Route path="/supplier"             element={<Navigate to="/supplier/dashboard" replace />} />
                <Route path="/supplier/orders"      element={
                    <RoleGuard allowedRoles={['SUPPLIER_ADMIN', 'SUPER_ADMIN']}>
                        <SupplierOrdersPage />
                    </RoleGuard>
                } />
                <Route path="/supplier/orders/:id"  element={
                    <RoleGuard allowedRoles={['SUPPLIER_ADMIN', 'SUPER_ADMIN']}>
                        <SupplierOrderDetailPage />
                    </RoleGuard>
                } />

                {/* ── Admin routes ────────────────────────────── */}
                <Route path="/admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index                  element={<AdminDashboardPage />} />
                    <Route path="overview"        element={<AdminDashboardPage />} />
                    <Route path="orders"          element={<AdminOrdersPage />} />
                    <Route path="orders/:id"      element={<AdminOrderDetailPage />} />
                    <Route path="products"        element={<AdminProductsPage />} />
                    <Route path="suppliers"       element={<AdminSuppliersPage />} />
                    <Route path="suppliers/:id"   element={<AdminSupplierDetailsPage />} />
                    <Route path="categories"      element={<AdminCategoriesPage />} />
                    <Route path="customers"       element={<AdminCustomersPage />} />
                    <Route path="postcodes"       element={<AdminPostcodesPage />} />
                    <Route path="users"           element={<AdminUsersPage />} />
                    <Route path="settings"        element={<AdminDashboardPage />} />
                </Route>

                {/* ── 404 Case ────────────────────────────────── */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
        )
    );
}

function App() {
    return (
        <AppErrorBoundary>
            <AuthProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </AuthProvider>
        </AppErrorBoundary>
    );
}

export default App;
