import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/format';
import type { DeliveryMethod, PaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { shopApi } from '@/services/api';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    comment: '',
    delivery_method: 'CARGO' as DeliveryMethod,
    payment_method: 'CASH' as PaymentMethod,
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const subtotal = getTotal();
  const shipping = 50000;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast({ title: t('checkout.requiredField'), variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => {
        // Try exact match first
        let variant = item.product.variants.find(v => v.size === item.size && v.color === item.color);

        // Fallback: If not found, try any variant with stock > 0
        if (!variant) {
          variant = item.product.variants.find(v => v.stock > 0) || item.product.variants[0];
        }

        return {
          sku_id: variant?.id,
          qty: item.quantity
        };
      }).filter(i => i.sku_id);

      const payload = {
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        customer_comment: form.comment,
        delivery_method: form.delivery_method,
        payment_method: form.payment_method,
        items: orderItems,
      };

      console.log("Creating order with payload:", payload);

      const res = await shopApi.createOrder(payload);
      clearCart();
      navigate(`/order-success?token=${res.public_token}&order=${res.order_number}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      const detail = error.response?.data?.detail || t('checkout.orderError');
      toast({ title: detail, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container-shop py-4">
      <Breadcrumbs items={[
        { label: t('common.home'), path: '/' },
        { label: t('cart.title'), path: '/cart' },
        { label: t('checkout.title') },
      ]} />

      <h1 className="text-2xl font-bold mb-8">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          {/* Name */}
          <Field label={t('checkout.name')} required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={t('checkout.namePlaceholder')}
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </Field>

          {/* Phone */}
          <Field label={t('checkout.phone')} required>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder={t('checkout.phonePlaceholder')}
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </Field>

          {/* Address */}
          <Field label={t('checkout.address')} required>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder={t('checkout.addressPlaceholder')}
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
          </Field>

          {/* Comment */}
          <Field label={t('checkout.comment')}>
            <textarea
              value={form.comment}
              onChange={(e) => update('comment', e.target.value)}
              placeholder={t('checkout.commentPlaceholder')}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </Field>

          {/* Delivery */}
          <Field label={t('checkout.deliveryMethod')}>
            <div className="space-y-2">
              {(['CARGO', 'COURIER', 'PICKUP'] as DeliveryMethod[]).map((m) => (
                <label key={m} className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:border-foreground transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    checked={form.delivery_method === m}
                    onChange={() => update('delivery_method', m)}
                  />
                  <span className="text-sm">{t(`checkout.delivery${m.charAt(0) + m.slice(1).toLowerCase()}` as any)}</span>
                </label>
              ))}
            </div>
          </Field>

          {/* Payment */}
          <Field label={t('checkout.paymentMethod')}>
            <div className="space-y-2">
              {(['CASH', 'CARD'] as PaymentMethod[]).map((m) => (
                <label key={m} className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer hover:border-foreground transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment_method === m}
                    onChange={() => update('payment_method', m)}
                  />
                  <span className="text-sm">{t(`checkout.payment${m.charAt(0) + m.slice(1).toLowerCase()}` as any)}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        {/* Summary */}
        <div className="rounded-md border border-border p-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold mb-4">{t('cart.title')}</h2>
          <div className="space-y-2 text-sm mb-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex justify-between">
                <span className="text-muted-foreground truncate mr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium shrink-0">
                  {formatPrice(item.product.public_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('cart.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('cart.shipping')}</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(total)} {t('common.currency')}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-foreground text-background py-3.5 text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('checkout.placeOrder')}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
