import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

/**
 * useProducts
 * ─────────────────────────────────────────────────────────────────────────────
 * Professional hook for fetching products with TanStack Query.
 * Handles caching, stale-time, loading, and error states out-of-the-box.
 * 
 * @param {Object} params - Query parameters (page, limit, category, etc.)
 */
export const useProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const { data } = await apiClient.get('/products', { params });
            return data;
        },
        // Preserve previous data while loading new pages for a smoother UX
        placeholderData: (previousData) => previousData,
    });
};

/**
 * useProduct
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetch a single product by ID or slug.
 */
export const useProduct = (id) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/products/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
