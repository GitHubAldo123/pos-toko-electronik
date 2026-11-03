import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  calculateProfit,
  calculateMargin,
  formatMargin,
  calculateDiscountAmount,
  calculateChange,
} from './money.js';

test('formatRupiah formats Indonesian currency with dot separators', () => {
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(1500000), 'Rp 1.500.000');
  assert.equal(formatRupiah(250), 'Rp 250');
  assert.equal(formatRupiah(123456789), 'Rp 123.456.789');
});

test('calculateProfit correctly calculates sellPrice - buyPrice', () => {
  assert.equal(calculateProfit(1500000, 1200000), 300000);
  assert.equal(calculateProfit(500, 200), 300);
  assert.equal(calculateProfit(1000, 1000), 0);
  assert.equal(calculateProfit(800, 1000), -200);
});

test('calculateMargin calculates margin percentage correctly', () => {
  // Margin = (300000 / 1500000) * 100 = 20%
  const margin = calculateMargin(1500000, 1200000);
  assert.equal(margin, 20);
  assert.equal(formatMargin(margin), '20.0%');

  // Margin with decimals
  const margin2 = calculateMargin(1000, 750); // 250 / 1000 = 25%
  assert.equal(margin2, 25);

  // If sell price is zero, avoid divide-by-zero
  assert.equal(calculateMargin(0, 500), 0);
});

test('calculateDiscountAmount handles percent and nominal discounts', () => {
  // 10% on 100,000 = 10,000
  assert.equal(calculateDiscountAmount(100000, 'percent', 10), 10000);
  // Nominal 15,000
  assert.equal(calculateDiscountAmount(100000, 'nominal', 15000), 15000);
  // Discount cannot exceed subtotal
  assert.equal(calculateDiscountAmount(50000, 'nominal', 80000), 50000);
  // 0 discount
  assert.equal(calculateDiscountAmount(50000, 'nominal', 0), 0);
});

test('calculateChange calculates cash kembalian accurately', () => {
  assert.equal(calculateChange(100000, 75000), 25000);
  assert.equal(calculateChange(50000, 50000), 0);
  assert.equal(calculateChange(40000, 50000), 0); // No negative change
});
