import axios from 'axios';
import { Product, Category, CargoSettings, CreateOrderPayload, CreateOrderResponse } from '../types';

const RAW_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_URL = RAW_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

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
            const response = await api.get('/api/categories/');
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
        const response = await api.get('/api/brands/');
        if (Array.isArray(response.data)) {
            return response.data;
        }
        return response.data.results || [];
    },

    // Products
    getProducts: async (params?: Record<string, any>): Promise<{ results: Product[], count: number }> => {
        try {
            const response = await api.get('/api/products/', { params });
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
        const response = await api.get(`/api/products/${slug}/`);
        return response.data;
    },

    // Cargo Settings
    getCargoSettings: async (): Promise<CargoSettings> => {
        const response = await api.get('/api/cargo-settings/');
        return response.data;
    },

    // Orders
    createOrder: async (payload: any): Promise<CreateOrderResponse> => {
        const response = await api.post('/api/orders/', payload);
        return response.data;
    },

    getOrderByToken: async (token: string): Promise<any> => {
        const response = await api.get(`/api/orders/public/${token}/`);
        return response.data;
    },

    getPaymeUrl: async (token: string): Promise<{ url: string }> => {
        const response = await api.get(`/api/orders/public/${token}/payme-url/`);
        return response.data;
    },

    getPaymentInstructions: async (): Promise<{ card_number: string, card_holder: string, instructions: string }> => {
        const response = await api.get('/api/orders/payment-instructions/');
        return response.data;
    },

    submitReceipt: async (orderId: string | number, file: File, note: string = ''): Promise<any> => {
        const formData = new FormData();
        formData.append('order_id', String(orderId));
        formData.append('receipt_image', file);
        formData.append('note', note);
        const response = await api.post('/api/payment/receipt/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
