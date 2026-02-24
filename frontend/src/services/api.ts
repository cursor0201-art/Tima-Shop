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
        try {
            const response = await api.get('/categories/');
            if (response.status !== 200) {
                console.error('Categories API error:', response.status, response.data);
                throw new Error(`Failed to fetch categories: ${response.status}`);
            }
            if (Array.isArray(response.data)) {
                return response.data;
            }
            return response.data.results || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
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
        try {
            const response = await api.get('/products/', { params });
            if (response.status !== 200) {
                console.error('Products API error:', response.status, response.data);
                throw new Error(`Failed to fetch products: ${response.status}`);
            }
            if (Array.isArray(response.data)) {
                return { results: response.data, count: response.data.length };
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
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
