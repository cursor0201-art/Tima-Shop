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

  // Calculate based on weight per gram (13,000 per 100g = 130 per gram)
  const price_per_gram = settings.price_per_kg ? Number(settings.price_per_kg) / 1000 : 130;
  const final_shipping = totalWeightGrams * price_per_gram;

  console.log(`DEBUG: Final Calculation:`);
  console.log(`- Total Weight: ${totalWeightGrams}g`);
  console.log(`- Price per Gram: ${price_per_gram}`);
  console.log(`- Final Shipping: ${final_shipping}`);

  return final_shipping;
}
