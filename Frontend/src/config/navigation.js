export const NAV_LINKS = [
    { label: 'Home',      href: '/'         },
    { label: 'Shop',      href: '/products' },
    { label: 'About',     href: '/#about'   },
    { label: 'Contact',   href: '/#contact' },
];

export const FOOTER_LINKS = {
    company: [
        { label: 'About Us',     href: '/#about'    },
        { label: 'Our Heritage', href: '/#heritage' },
        { label: 'How It Works', href: '/#how'      },
        { label: 'Careers',      href: '/careers'   },
    ],
    shop: [
        { label: 'All Products', href: '/products'             },
        { label: 'Beef',         href: '/products?category=BEEF'    },
        { label: 'Lamb',         href: '/products?category=LAMB'    },
        { label: 'Poultry',      href: '/products?category=POULTRY' },
        { label: 'Goat',         href: '/products?category=GOAT'    },
    ],
    support: [
        { label: 'Track Order',  href: '/account/orders' },
        { label: 'My Account',   href: '/account'        },
        { label: 'Contact Us',   href: '/#contact'       },
        { label: 'Returns',      href: '/#contact'       },
    ],
};

export const LAYOUT_CONFIG = [
    { path: '/',              hideNavbar: false, hideFooter: false },
    { path: '/checkout',      hideNavbar: false, hideFooter: false },
    { path: '/login',         hideNavbar: false, hideFooter: false },
    { path: '/register',      hideNavbar: false, hideFooter: false },
    { path: '/account',       hideNavbar: true,  hideFooter: true  },
    { path: '/account/orders',hideNavbar: true,  hideFooter: true  },
    { path: '/orders',        hideNavbar: true,  hideFooter: true  },
];
