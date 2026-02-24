import axios, { AxiosError } from 'axios';
import type {
  Category,
  Product,
  PaginatedResponse,
  ProductFilters,
  CargoSettings,
  CreateOrderPayload,
  CreateOrderResponse,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ---- Error helper ----
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

function handleError(err: unknown): never {
  if (err instanceof AxiosError) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.detail || err.message;
    throw new ApiError(message, status);
  }
  throw err;
}

// ---- API methods ----

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { data } = await client.get<Category[]>('/categories/');
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  try {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.size) params.size = filters.size;
    if (filters.color) params.color = filters.color;
    if (filters.min_price !== undefined) params.min_price = String(filters.min_price);
    if (filters.max_price !== undefined) params.max_price = String(filters.max_price);
    if (filters.in_stock !== undefined) params.in_stock = String(filters.in_stock);
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = String(filters.page);

    const { data } = await client.get<PaginatedResponse<Product>>('/products/', { params });
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function fetchProduct(slug: string): Promise<Product> {
  try {
    const { data } = await client.get<Product>(`/products/${slug}/`);
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function fetchCargoSettings(): Promise<CargoSettings> {
  try {
    const { data } = await client.get<CargoSettings>('/settings/cargo/');
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  try {
    const { data } = await client.post<CreateOrderResponse>('/orders/', payload);
    return data;
  } catch (e) {
    return handleError(e);
  }
}

export default client;
