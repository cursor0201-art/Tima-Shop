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
    <Link to={`/product/${product.slug}`} className="group block animate-fade-in">
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary">
        <img
          src={product.images[0]?.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.old_price && (
            <span className="rounded bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
              {t('common.sale')}
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
          aria-label={inWishlist ? t('common.removeFromWishlist') : t('common.addToWishlist')}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Quick add */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 right-0 bg-foreground/90 text-background py-2.5 text-xs font-medium uppercase tracking-wider opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          {t('common.addToCart')}
        </button>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand?.name}</p>
        <h3 className="text-sm font-medium leading-tight text-foreground">{product.name}</h3>
        <PriceBlock price={product.public_price} oldPrice={product.old_price} />
      </div>
    </Link>
  );
}

export function PriceBlock({ price, oldPrice }: { price: number; oldPrice?: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-foreground">
        {formatPrice(price)} {t('common.currency')}
      </span>
      {oldPrice && (
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(oldPrice)} {t('common.currency')}
        </span>
      )}
    </div>
  );
}
