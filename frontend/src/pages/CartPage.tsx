import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/format';
import { calculateShipping } from '@/lib/shipping';
import { shopApi } from '@/services/api';
import { CargoSettings } from '@/types';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const [cargoSettings, setCargoSettings] = useState<CargoSettings | null>(null);

  useEffect(() => {
    shopApi.getCargoSettings().then(setCargoSettings).catch(console.error);
  }, []);

  const subtotal = getTotal();
  const shipping = calculateShipping(items, cargoSettings);
  console.log("DEBUG: Cart Shipping:", shipping);
  const total = subtotal + shipping;

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('cart.title') },
      ]} />

      <h1 className="text-2xl font-bold mb-8">{t('cart.title')}</h1>

      {items.length === 0 ? (
        <EmptyState
          title={t('cart.empty')}
          description={t('cart.emptyHint')}
          action={
            <Link to="/catalog" className="rounded-md bg-foreground text-background px-6 py-2.5 text-sm font-medium">
              {t('cart.continueShopping')}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 rounded-md border border-border p-4">
                <Link to={`/product/${item.product.slug}`} className="w-20 h-24 rounded overflow-hidden bg-secondary shrink-0">
                  <img src={item.product.images[0]?.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-sm font-medium hover:underline">{item.product.name}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.size} / {item.color}
                    {(() => {
                      const v = item.product.variants.find(v => v.size === item.size && v.color === item.color);
                      return v?.weight_grams ? ` • ${v.weight_grams}г` : '';
                    })()}
                  </p>
                  <p className="text-sm font-semibold mt-2">{formatPrice(item.product.public_price)} {t('common.currency')}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-border hover:border-foreground transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-border hover:border-foreground transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.product.id, item.size, item.color)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors self-start"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-md border border-border p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold mb-4">{t('cart.title')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal)} {t('common.currency')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('cart.shipping')}</span>
                <span className="font-medium">{formatPrice(shipping)} {t('common.currency')}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base font-semibold">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)} {t('common.currency')}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-6 block w-full text-center rounded-md bg-foreground text-background py-3.5 text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90 transition-colors"
            >
              {t('cart.checkout')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
