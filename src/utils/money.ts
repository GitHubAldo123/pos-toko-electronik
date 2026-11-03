/**
 * Pure monetary and accounting calculations for SI TOKO.
 * Handles integer Rupiah math, margins, discounts, and formatting.
 */

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const rounded = Math.round(amount);
  return 'Rp ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) {
    return '0';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Keuntungan kotor per unit:
 * Keuntungan = Harga Jual - Harga Modal
 */
export function calculateProfit(sellPrice: number, buyPrice: number): number {
  return (sellPrice || 0) - (buyPrice || 0);
}

/**
 * Rumus margin:
 * Margin (%) = (Keuntungan / Harga Jual) * 100%
 * If sellPrice <= 0, returns 0.
 */
export function calculateMargin(sellPrice: number, buyPrice: number): number {
  if (!sellPrice || sellPrice <= 0) return 0;
  const profit = calculateProfit(sellPrice, buyPrice);
  return (profit / sellPrice) * 100;
}

/**
 * Format margin as string with 1 decimal place e.g. "25.0%"
 */
export function formatMargin(marginPercent: number): string {
  if (isNaN(marginPercent)) return '0.0%';
  return marginPercent.toFixed(1) + '%';
}

/**
 * Calculates discount amount given subtotal, type, and value
 */
export function calculateDiscountAmount(
  subtotal: number,
  discountType: 'nominal' | 'percent',
  discountValue: number
): number {
  if (!discountValue || discountValue <= 0) return 0;
  if (discountType === 'percent') {
    const calculated = (subtotal * discountValue) / 100;
    return Math.min(subtotal, Math.round(calculated));
  }
  return Math.min(subtotal, Math.round(discountValue));
}

/**
 * Computes change (kembalian) for cash payment
 */
export function calculateChange(amountPaid: number, grandTotal: number): number {
  const diff = (amountPaid || 0) - (grandTotal || 0);
  return diff > 0 ? diff : 0;
}
