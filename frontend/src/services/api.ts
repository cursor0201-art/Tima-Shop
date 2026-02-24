import axios from 'axios';
import { Product, Category, CargoSettings, CreateOrderPayload, CreateOrderResponse } from '../types';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const shopApi = {
    // Categories
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/categories/');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return response.data.results || [];
    },

    // Brands
    getBrands: async (): Promise<any[]> => {
        const response = await api.get('/brands/');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return response.data.results || [];
    },

    // Products
    getProducts: async (params?: Record<string, any>): Promise<{ results: Product[], count: number }> => {
        // Handling Pagination from Django DRF (returns { count, next, previous, results })
        const response = await api.get('/products/', { params });
        if (Array.isArray(response.data)) {
            return { results: response.data, count: response.data.length }; // Fallback if no pagination
        }
        return response.data;
    },

    getProductBySlug: async (slug: string): Promise<Product> => {
        const response = await api.get(`/products/${slug}/`);
        return response.data;
    },

    // Cargo Settings
    getCargoSettings: async (): Promise<CargoSettings> => {
        const response = await api.get('/cargo-settings/');
        return response.data;
    },

    // Orders
    createOrder: async (payload: any): Promise<CreateOrderResponse> => {
        const response = await api.post('/orders/', payload);
        return response.data;
    },

    getOrderByToken: async (token: string): Promise<any> => {
        const response = await api.get(`/orders/public/${token}/`);
        return response.data;
    }
};
