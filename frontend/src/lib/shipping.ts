import { CartItem, CargoSettings } from '../types';

export function calculateShipping(items: CartItem[], settings: CargoSettings | null): number {
  if (!settings || items.length === 0) return 0;

  const subtotal = items.reduce((sum, item) => sum + item.product.public_price * item.quantity, 0);
  let totalWeightGrams = 0;

  items.forEach((item, index) => {
    const variant = item.product.variants.find(
      v => v.size === item.size && v.color === item.color
    );
    const weight = variant?.weight_grams || 0;
    console.log(`DEBUG: Item ${index} (${item.product.name}), SKU: ${item.size}/${item.color}, Weight: ${weight}g, Qty: ${item.quantity}`);
    if (variant && variant.weight_grams) {
      totalWeightGrams += variant.weight_grams * item.quantity;
    }
  });

  console.log(`DEBUG: Total weight: ${totalWeightGrams}g, Pricing Mode: ${settings.pricing_mode}`);

  // Force weight-based calculation if we have weight, or follow settings
  if (settings.pricing_mode === 'BY_WEIGHT' || (totalWeightGrams > 0 && !settings.fixed_fee)) {
    const rate = Number(settings.price_per_kg || 500000); // Default to 500,000 per kg if not set
    const fee = (totalWeightGrams / 1000) * rate;
    console.log(`DEBUG: Using WEIGHT-BASED fee: ${fee} (Weight: ${totalWeightGrams}g, Rate: ${rate}/kg)`);
    return fee;
  }

  if (settings.pricing_mode === 'FIXED') {
    const fee = Number(settings.fixed_fee || 0);
    console.log(`DEBUG: Using FIXED fee: ${fee}`);
    return fee;
  }

  if (settings.pricing_mode === 'PERCENT') {
    const fee = (subtotal * Number(settings.percent_rate || 0)) / 100;
    console.log(`DEBUG: Using PERCENT fee: ${fee} (${settings.percent_rate}%)`);
    return fee;
  }

  return 0;
}
