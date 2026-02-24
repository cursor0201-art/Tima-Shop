import { create } from 'zustand';
import type { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('tima_shop_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem('tima_shop_cart', JSON.stringify(items));
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadCart(),

  addItem: (product, size, color) => {
    set((state) => {
      const existing = state.items.find(
        (i) => i.product.id === product.id && i.size === size && i.color === color
      );
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.product.id === product.id && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newItems = [...state.items, { product, size, color, quantity: 1 }];
      }
      saveCart(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId, size, color) => {
    set((state) => {
      const newItems = state.items.filter(
        (i) => !(i.product.id === productId && i.size === size && i.color === color)
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (productId, size, color, quantity) => {
    set((state) => {
      const newItems = quantity <= 0
        ? state.items.filter(
            (i) => !(i.product.id === productId && i.size === size && i.color === color)
          )
        : state.items.map((i) =>
            i.product.id === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          );
      saveCart(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  getTotal: () => get().items.reduce((sum, i) => sum + i.product.public_price * i.quantity, 0),
  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
