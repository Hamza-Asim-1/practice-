export const PRODUCT_CATEGORIES = [
    {
        key   : 'BEEF',
        label : 'Beef',
        sub   : 'Ribeye · Tenderloin · Brisket · Mince',
        image : 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800',
        badge : 'BEST SELLER',
        color : '#eb5757',
        count : '20+ cuts',
    },
    {
        key   : 'LAMB',
        label : 'Lamb',
        sub   : 'Leg · Chops · Shoulder · Rack',
        image : 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?q=80&w=800',
        badge : null,
        color : '#60a5fa',
        count : '12+ cuts',
    },
    {
        key   : 'POULTRY',
        label : 'Poultry',
        sub   : 'Whole · Breast · Thighs · Wings',
        image : 'https://images.unsplash.com/photo-1604503468506-a8da13d11d36?q=80&w=800',
        badge : null,
        color : '#fbbf24',
        count : '10+ cuts',
    },
    {
        key   : 'GOAT',
        label : 'Goat',
        sub   : 'Leg · Shoulder · Chops · Whole',
        image : 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?q=80&w=800',
        badge : null,
        color : '#c084fc',
        count : '8+ cuts',
    },
];

export const CATEGORY_KEYS = ['ALL', ...PRODUCT_CATEGORIES.map(c => c.key)];
