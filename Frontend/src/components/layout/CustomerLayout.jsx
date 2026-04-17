import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { LAYOUT_CONFIG } from '../../config/navigation';

/**
 * CustomerLayout
 * Wraps customer-facing pages with Navbar + Footer.
 * Visibility is driven entirely by LAYOUT_CONFIG in siteContent.js —
 * just add/edit a path entry there; no changes needed here.
 */
const CustomerLayout = ({ children }) => {
    const { pathname } = useLocation();

    // Longest matching config entry wins (most specific path takes priority)
    const match = LAYOUT_CONFIG
        .filter(cfg => pathname === cfg.path || pathname.startsWith(cfg.path + '/'))
        .sort((a, b) => b.path.length - a.path.length)[0];

    const hideNavbar = match?.hideNavbar ?? false;
    const hideFooter = match?.hideFooter ?? false;

    return (
        <>
            {!hideNavbar && <Navbar />}
            <main>{children}</main>
            {!hideFooter && <Footer />}
        </>
    );
};

export default CustomerLayout;
