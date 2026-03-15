import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();
  const { isInWishlist, addItem: addWish, removeItem: removeWish } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const inWishlist = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inWishlist ? removeWish(product.id) : addWish(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const v = product.variants.find((v) => v.stock > 0);
    if (v) addToCart(product, v.size, v.color);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block animate-fade-in relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-anthracite">
        <img
          src={product.images[0]?.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Dark subtle overlay for lower contrast */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.old_price && (
            <span className="bg-gold px-3 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-black shadow-lg">
              {t('common.sale')}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-gold hover:text-black transition-all duration-300 z-10 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          aria-label={inWishlist ? t('common.removeFromWishlist') : t('common.addToWishlist')}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* Quick add */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md text-white py-4 text-xs font-light uppercase tracking-[0.2em] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:text-gold z-10"
        >
          {t('common.addToCart')}
        </button>
      </div>

      <div className="mt-5 space-y-2 text-center px-2">
        <p className="text-[10px] text-foreground/50 uppercase tracking-[0.2em]">{product.brand?.name || 'TIMA_SHOP'}</p>
        <h3 className="text-sm font-serif font-medium leading-relaxed text-foreground tracking-wide group-hover:text-gold transition-colors duration-300 line-clamp-2 title-font">{product.name}</h3>
        <div className="pt-2">
          <PriceBlock price={product.public_price} oldPrice={product.old_price} />
        </div>
      </div>
    </Link>
  );
}

export function PriceBlock({ price, oldPrice }: { price: number; oldPrice?: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm font-sans font-medium text-foreground tracking-wider">
        {formatPrice(price)} {t('common.currency')}
      </span>
      {oldPrice && (
        <span className="text-xs text-foreground/40 line-through tracking-wider">
          {formatPrice(oldPrice)} {t('common.currency')}
        </span>
      )}
    </div>
  );
}
