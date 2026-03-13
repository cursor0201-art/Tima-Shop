export interface ProductImage {
  id: string;
  image_url: string;
  is_main: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string; // SKU ID
  size: string;
  color: string;
  stock: number;
  weight_grams: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  public_price: number;
  old_price?: number;
  images: ProductImage[];
  category: Category;
  brand: { id: string, name: string, slug: string };
  variants: ProductVariant[];
  specs: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

// ---- Category ----
export interface Category {
  id: string;
  slug: string;
  name: string;
  image?: string;
  product_count: number;
}

// ---- Cargo / settings ----
export type CargoPricingMode = 'FIXED' | 'PERCENT' | 'BY_WEIGHT';

export interface CargoSettings {
  pricing_mode: CargoPricingMode;
  fixed_fee: number | null;
  percent_rate: number | null;
  price_per_kg: number | null;
  description_ru: string;
  description_uz: string;
  eta_days_min: number;
  eta_days_max: number;
}

// ---- Order ----
export type DeliveryMethod = 'CARGO' | 'COURIER' | 'PICKUP';
export type PaymentMethod = 'CASH' | 'CARD';

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  comment: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
}

export interface OrderItem {
  product_id: string;
  variant_size: string;
  variant_color: string;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  customer: OrderFormData;
}

export interface CreateOrderResponse {
  order_number: string;
  public_token: string;
  telegram_url: string;
}

// ---- Cart ----
export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

// ---- Wishlist ----
export interface WishlistItem {
  product: Product;
}

// ---- API responses ----
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
}
