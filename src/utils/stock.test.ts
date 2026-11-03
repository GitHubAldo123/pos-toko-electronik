import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getStockStatus,
  calculateStockAdjustment,
  calculateTotalInventoryValue,
  calculateTotalStockCount,
} from './stock.js';
import { Product } from '../types/index.js';

test('getStockStatus correctly identifies status', () => {
  assert.equal(getStockStatus(0, 5), 'OUT_OF_STOCK');
  assert.equal(getStockStatus(-2, 5), 'OUT_OF_STOCK');
  assert.equal(getStockStatus(3, 5), 'LOW_STOCK');
  assert.equal(getStockStatus(5, 5), 'LOW_STOCK');
  assert.equal(getStockStatus(6, 5), 'NORMAL');
  assert.equal(getStockStatus(100, 10), 'NORMAL');
});

test('calculateStockAdjustment calculates physical count difference', () => {
  // Current 10, counted 15 -> +5 IN
  const adj1 = calculateStockAdjustment(10, 15);
  assert.equal(adj1.difference, 5);
  assert.equal(adj1.type, 'IN');

  // Current 10, counted 7 -> -3 OUT
  const adj2 = calculateStockAdjustment(10, 7);
  assert.equal(adj2.difference, -3);
  assert.equal(adj2.type, 'OUT');
});

test('calculateTotalInventoryValue and TotalStockCount', () => {
  const dummyProducts: Partial<Product>[] = [
    { buyPrice: 100000, stock: 5 },
    { buyPrice: 50000, stock: 10 },
    { buyPrice: 200000, stock: 0 },
  ];
  // 100k*5 + 50k*10 = 500k + 500k = 1,000,000
  assert.equal(calculateTotalInventoryValue(dummyProducts as Product[]), 1000000);
  assert.equal(calculateTotalStockCount(dummyProducts as Product[]), 15);
});
