import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
  const { t } = useTranslation();
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const handleMoveToCart = (product: typeof items[0]) => {
    const v = product.variants.find((v) => v.stock > 0);
    if (v) {
      addToCart(product, v.size, v.color);
      removeItem(product.id);
      toast({ title: t('common.addToCart') + ' ✓' });
    }
  };

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('wishlist.title') },
      ]} />

      <h1 className="text-2xl font-bold mb-8">{t('wishlist.title')}</h1>

      {items.length === 0 ? (
        <EmptyState
          title={t('wishlist.empty')}
          description={t('wishlist.emptyHint')}
          action={
            <Link to="/catalog" className="rounded-md bg-foreground text-background px-6 py-2.5 text-sm font-medium">
              {t('common.catalog')}
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((product) => (
            <div key={product.id} className="flex gap-4 rounded-md border border-border p-4">
              <Link to={`/product/${product.slug}`} className="w-20 h-24 rounded overflow-hidden bg-secondary shrink-0">
                <img src={product.images[0]?.url} alt={product.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase">{product.brand}</p>
                <Link to={`/product/${product.slug}`} className="text-sm font-medium hover:underline">{product.name}</Link>
                <p className="text-sm font-semibold mt-1">{formatPrice(product.public_price)} {t('common.currency')}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title={t('wishlist.moveToCart')}
                >
                  <ShoppingBag size={18} />
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  title={t('common.remove')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
