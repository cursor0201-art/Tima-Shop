import { create } from 'zustand';
import type { Product } from '@/types';

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getCount: () => number;
}

function loadWishlist(): Product[] {
  try {
    const raw = localStorage.getItem('tima_shop_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: Product[]) {
  localStorage.setItem('tima_shop_wishlist', JSON.stringify(items));
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: loadWishlist(),

  addItem: (product) => {
    set((state) => {
      if (state.items.find((i) => i.id === product.id)) return state;
      const newItems = [...state.items, product];
      saveWishlist(newItems);
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== productId);
      saveWishlist(newItems);
      return { items: newItems };
    });
  },

  isInWishlist: (productId) => get().items.some((i) => i.id === productId),
  getCount: () => get().items.length,
}));
