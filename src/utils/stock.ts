import { Product } from '../types/index.js';

export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'NORMAL';

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock <= minStock) return 'LOW_STOCK';
  return 'NORMAL';
}

export function getStockStatusLabel(status: StockStatus): {
  label: string;
  badgeClass: string;
} {
  switch (status) {
    case 'OUT_OF_STOCK':
      return {
        label: 'Habis',
        badgeClass: 'bg-red-100 text-red-700 border border-red-200',
      };
    case 'LOW_STOCK':
      return {
        label: 'Menipis',
        badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      };
    case 'NORMAL':
    default:
      return {
        label: 'Aman',
        badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      };
  }
}

export function calculateStockAdjustment(currentStock: number, physicalCount: number): {
  difference: number;
  type: 'IN' | 'OUT' | 'ADJUST';
} {
  const difference = physicalCount - currentStock;
  return {
    difference,
    type: difference >= 0 ? 'IN' : 'OUT',
  };
}

export function filterLowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.stock <= p.minStock && p.stock > 0);
}

export function filterOutOfStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.stock <= 0);
}

export function calculateTotalInventoryValue(products: Product[]): number {
  return products.reduce((total, p) => total + (p.buyPrice * Math.max(0, p.stock)), 0);
}

export function calculateTotalStockCount(products: Product[]): number {
  return products.reduce((total, p) => total + Math.max(0, p.stock), 0);
}
