import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../config/branding';
import Hero from '../components/HomeV2/Hero';
import AboutUs from '../components/HomeV2/AboutUs';
import ProductGrid from '../components/HomeV2/ProductGrid';
import Contact from '../components/HomeV2/Contact';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user?.role === 'SUPPLIER_ADMIN') {
            if (user?.status === 'PENDING') {
                navigate('/supplier/pending');
            } else {
                navigate('/supplier/dashboard');
            }
        } else if (user?.role === 'SUPER_ADMIN') {
            navigate('/admin');
        }
    }, [user, navigate]);

    return (
        <div className="bg-bg-dark">
            <Helmet>
                <title>{BRAND.name} | Premium Artisanal Butchery & Steaks</title>
                <meta name="description" content="Discover the finest cuts of meat at Teza. From grass-fed beef to artisanal poultry, we bring premium quality from the farm to your table." />
            </Helmet>
            <Hero />
            <AboutUs />
            <ProductGrid />
            <Contact />
        </div>
    );
};

export default HomePage;
