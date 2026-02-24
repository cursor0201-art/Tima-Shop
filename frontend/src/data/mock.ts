import type { Product, Category, PaginatedResponse } from '@/types';

export const mockCategories: Category[] = [
  { id: '1', slug: 'clothing', name: 'Одежда', product_count: 48 },
  { id: '2', slug: 'shoes', name: 'Обувь', product_count: 32 },
  { id: '3', slug: 'accessories', name: 'Аксессуары', product_count: 24 },
  { id: '4', slug: 'bags', name: 'Сумки', product_count: 16 },
];

const createProduct = (
  id: string,
  slug: string,
  name: string,
  price: number,
  category: string,
  opts: Partial<Product> = {}
): Product => ({
  id,
  slug,
  name,
  description: 'Высококачественный товар из последней коллекции. Идеально подходит для повседневной носки и особых случаев.',
  public_price: price,
  images: [
    { id: '1', url: `https://images.unsplash.com/photo-${id === '1' ? '1523275335684-37898b6baf30' : id === '2' ? '1542291026-7eec264c27ff' : id === '3' ? '1553062407-98eeb64c6a62' : id === '4' ? '1548036328-c9fa89d128fa' : id === '5' ? '1591047139829-d91aecb6caea' : id === '6' ? '1560243563-062bfc001d68' : id === '7' ? '1556906781-9a412961c28c' : '1595950653106-6c9ebd614d3a'}?w=600&h=800&fit=crop`, alt: name },
  ],
  category,
  brand: ['Nike', 'Adidas', 'Zara', 'H&M'][Number(id) % 4],
  variants: [
    { size: 'S', color: 'Чёрный', stock: 5 },
    { size: 'M', color: 'Чёрный', stock: 3 },
    { size: 'L', color: 'Белый', stock: 0 },
    { size: 'M', color: 'Белый', stock: 7 },
  ],
  characteristics: [
    { key: 'Материал', value: 'Хлопок 100%' },
    { key: 'Сезон', value: 'Весна-Лето' },
    { key: 'Страна', value: 'Турция' },
  ],
  is_new: Number(id) <= 4,
  is_popular: Number(id) % 2 === 0,
  is_sale: Number(id) % 3 === 0,
  old_price: Number(id) % 3 === 0 ? Math.round(price * 1.3) : undefined,
  created_at: new Date().toISOString(),
  ...opts,
});

export const mockProducts: Product[] = [
  createProduct('1', 'oversized-tshirt', 'Oversized футболка', 189000, 'clothing'),
  createProduct('2', 'running-sneakers', 'Кроссовки для бега', 459000, 'shoes'),
  createProduct('3', 'leather-belt', 'Кожаный ремень', 129000, 'accessories'),
  createProduct('4', 'denim-jacket', 'Джинсовая куртка', 389000, 'clothing'),
  createProduct('5', 'summer-dress', 'Летнее платье', 249000, 'clothing'),
  createProduct('6', 'sport-shorts', 'Спортивные шорты', 159000, 'clothing'),
  createProduct('7', 'canvas-bag', 'Сумка-тоут', 219000, 'bags'),
  createProduct('8', 'classic-watch', 'Классические часы', 890000, 'accessories'),
];

export function getMockPaginatedProducts(
  filters: Record<string, string> = {}
): PaginatedResponse<Product> {
  let filtered = [...mockProducts];

  if (filters.category) filtered = filtered.filter((p) => p.category === filters.category);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  }

  return {
    items: filtered,
    total: filtered.length,
    page: 1,
    page_size: 20,
    total_pages: 1,
  };
}
