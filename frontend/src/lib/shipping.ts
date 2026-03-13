import { CartItem, CargoSettings } from '../types';

export function calculateShipping(items: CartItem[], settings: CargoSettings | null): number {
  if (!settings || items.length === 0) return 0;

  const subtotal = items.reduce((sum, item) => sum + item.product.public_price * item.quantity, 0);
  let totalWeightGrams = 0;

  items.forEach(item => {
    const variant = item.product.variants.find(
      v => v.size === item.size && v.color === item.color
    );
    if (variant && variant.weight_grams) {
      totalWeightGrams += variant.weight_grams * item.quantity;
    }
  });

  if (settings.pricing_mode === 'FIXED' && settings.fixed_fee !== null) {
    return Number(settings.fixed_fee);
  }

  if (settings.pricing_mode === 'PERCENT' && settings.percent_rate !== null) {
    return (subtotal * Number(settings.percent_rate)) / 100;
  }

  if (settings.pricing_mode === 'BY_WEIGHT' && settings.price_per_kg !== null) {
    return (totalWeightGrams / 1000) * Number(settings.price_per_kg);
  }

  return 0;
}
