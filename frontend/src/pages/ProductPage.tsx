import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingBag, Truck, Loader2 } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { PriceBlock } from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { shopApi } from '@/services/api';
import { Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { toast } = useToast();
  const addToCart = useCartStore((s) => s.addItem);
  const { isInWishlist, addItem: addWish, removeItem: removeWish } = useWishlistStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      shopApi.getProductBySlug(slug)
        .then(setProduct)
        .catch(() => setProduct(null))
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return <div className="container-shop py-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>;
  }

  if (!product) {
    return (
      <div className="container-shop py-20">
        <EmptyState
          title={t('product.notFound')}
          description={t('product.notFoundHint')}
          action={
            <Link to="/catalog" className="rounded-md bg-foreground text-background px-6 py-2.5 text-sm font-medium">
              {t('common.catalog')}
            </Link>
          }
        />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const uniqueSizes = [...new Set(product.variants.map((v) => v.size))];
  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const selectedVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({ title: t('product.selectSize'), variant: 'destructive' });
      return;
    }
    if (selectedVariant && selectedVariant.stock <= 0) {
      toast({ title: t('common.outOfStock'), variant: 'destructive' });
      return;
    }
    addToCart(product, selectedSize, selectedColor);
    toast({ title: t('common.addToCart') + ' ✓' });
  };

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('common.catalog'), path: '/catalog' },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
        {/* Gallery */}
        <div>
          <div className="aspect-[3/4] rounded-md overflow-hidden bg-secondary mb-3">
            <img
              src={product.images[activeImage]?.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-20 rounded overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-foreground' : 'border-transparent'
                    }`}
                >
                  <img src={img.image_url} alt={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{product.brand?.name}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
          </div>

          <PriceBlock price={product.public_price} oldPrice={product.old_price} />

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Size */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t('product.selectSize')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-[44px] rounded-md border px-3 py-2 text-sm font-medium transition-colors ${selectedSize === s
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {t('product.selectColor')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${selectedColor === c
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border hover:border-foreground'
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Stock info */}
          {selectedVariant && (
            <p className={`text-sm font-medium ${selectedVariant.stock > 0 ? 'text-success' : 'text-destructive'}`}>
              {selectedVariant.stock > 0
                ? t('product.remaining', { count: selectedVariant.stock })
                : t('common.outOfStock')}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background rounded-md py-3.5 text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              <ShoppingBag size={18} />
              {t('common.addToCart')}
            </button>
            <button
              onClick={() => inWishlist ? removeWish(product.id) : addWish(product)}
              className={`rounded-md border px-4 py-3.5 transition-colors ${inWishlist ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'
                }`}
              aria-label={t('common.addToWishlist')}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Characteristics */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {t('product.characteristics')}
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="border-b border-border last:border-0">
                      <td className="py-2 text-muted-foreground">{key}</td>
                      <td className="py-2 text-right font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Delivery info */}
          <div className="rounded-md border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={18} className="text-muted-foreground" />
              <h3 className="text-sm font-semibold">{t('product.deliveryInfo')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('deliveryPage.timingText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
