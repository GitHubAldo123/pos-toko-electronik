import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.js';
import { CartItem, PaymentMethod, SaleItemSnapshot } from '../types/index.js';
import {
  formatRupiah,
  formatNumber,
  calculateDiscountAmount,
  calculateChange,
} from '../utils/money.js';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  CreditCard,
  Banknote,
  QrCode,
  User,
  Printer,
  X,
  Boxes,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PosViewProps {
  onSaleSuccess: (saleId: string) => void;
}

export const PosView: React.FC<PosViewProps> = ({ onSaleSuccess }) => {
  const { products, services, categories, customers, createSale } = useStore();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState<string>('Pelanggan Umum');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'nominal' | 'percent'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [transactionNotes, setTransactionNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter products & services based on category and search
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    // Map products
    const productItems = products.map((p) => ({
      type: 'product' as const,
      id: p.id,
      code: p.code,
      name: p.name,
      categoryName: p.categoryName || 'Part Komputer',
      categoryId: p.categoryId,
      unit: p.unit,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      brand: p.brand,
      barcode: p.barcode,
    }));

    // Map active services
    const serviceItems = services
      .filter((s) => s.isActive)
      .map((s) => ({
        type: 'service' as const,
        id: s.id,
        code: s.code,
        name: s.name,
        categoryName: s.categoryName || 'Jasa Percetakan',
        categoryId: s.categoryId,
        unit: s.unit,
        buyPrice: s.costPrice,
        sellPrice: s.sellPrice,
        stock: 99999, // services unlimited stock
        brand: 'Percetakan',
        barcode: '',
      }));

    const combined = [...productItems, ...serviceItems];

    return combined.filter((item) => {
      // Category filter
      if (activeCategoryFilter !== 'all') {
        if (activeCategoryFilter === 'services' && item.type !== 'service') return false;
        if (activeCategoryFilter === 'computer') {
          const cat = categories.find((c) => c.id === item.categoryId);
          if (cat?.type !== 'computer') return false;
        }
        if (activeCategoryFilter === 'printing_supply') {
          const cat = categories.find((c) => c.id === item.categoryId);
          if (cat?.type !== 'printing_supply') return false;
        }
      }

      // Search term
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.barcode && item.barcode.includes(q)) ||
          item.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, services, categories, activeCategoryFilter, searchTerm]);

  // Cart calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return calculateDiscountAmount(subtotal, discountType, discountValue);
  }, [subtotal, discountType, discountValue]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  const change = useMemo(() => {
    if (paymentMethod === 'TUNAI') {
      return calculateChange(cashGiven, grandTotal);
    }
    return 0;
  }, [cashGiven, grandTotal, paymentMethod]);

  // Add item to cart
  const addToCart = (item: {
    type: 'product' | 'service';
    id: string;
    code: string;
    name: string;
    unit: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
  }) => {
    setErrorMessage(null);

    // Check existing
    const existing = cart.find(
      (c) => c.type === item.type && (item.type === 'product' ? c.productId === item.id : c.serviceId === item.id)
    );

    if (existing) {
      if (item.type === 'product' && existing.qty + 1 > item.stock) {
        setErrorMessage(`Stok "${item.name}" hanya tersisa ${item.stock} ${item.unit}.`);
        return;
      }
      setCart((prev) =>
        prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                qty: c.qty + 1,
                subtotal: (c.qty + 1) * c.sellPrice,
              }
            : c
        )
      );
    } else {
      if (item.type === 'product' && item.stock <= 0) {
        setErrorMessage(`Stok "${item.name}" saat ini habis.`);
        return;
      }
      const newCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        type: item.type,
        productId: item.type === 'product' ? item.id : undefined,
        serviceId: item.type === 'service' ? item.id : undefined,
        code: item.code,
        name: item.name,
        unit: item.unit,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        qty: 1,
        subtotal: item.sellPrice,
      };
      setCart((prev) => [...prev, newCartItem]);
    }
  };

  // Modify quantity
  const updateQty = (cartId: string, newQty: number) => {
    setErrorMessage(null);
    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }

    const item = cart.find((c) => c.id === cartId);
    if (item && item.type === 'product' && item.productId) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && newQty > prod.stock) {
        setErrorMessage(`Maksimal stok "${item.name}" adalah ${prod.stock} ${item.unit}.`);
        return;
      }
    }

    setCart((prev) =>
      prev.map((c) =>
        c.id === cartId
          ? {
              ...c,
              qty: newQty,
              subtotal: newQty * c.sellPrice,
            }
          : c
      )
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setCashGiven(0);
    setErrorMessage(null);
    setTransactionNotes('');
  };

  // Customer selection
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (!val) {
      setCustomCustomerName('Pelanggan Umum');
    } else {
      const cust = customers.find((c) => c.id === val);
      if (cust) {
        setCustomCustomerName(cust.name);
      }
    }
  };

  // Preset cash quick buttons
  const setExactCash = () => setCashGiven(grandTotal);
  const setPresetCash = (amount: number) => setCashGiven(amount);

  // Complete checkout transaction
  const handleCheckout = () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Keranjang masih kosong.');
      return;
    }

    if (paymentMethod === 'TUNAI' && cashGiven < grandTotal) {
      setErrorMessage(
        `Uang pembayaran tunai kurang Rp ${formatNumber(grandTotal - cashGiven)}.`
      );
      return;
    }

    // Prepare item snapshots with profit
    const itemsSnapshot: SaleItemSnapshot[] = cart.map((c) => {
      const itemId = (c.type === 'product' ? c.productId : c.serviceId) || '';
      const profit = (c.sellPrice - c.buyPrice) * c.qty;
      return {
        type: c.type,
        itemId,
        code: c.code,
        name: c.name,
        unit: c.unit,
        qty: c.qty,
        buyPrice: c.buyPrice,
        sellPrice: c.sellPrice,
        subtotal: c.subtotal,
        profit,
      };
    });

    const totalCost = itemsSnapshot.reduce((sum, item) => sum + item.buyPrice * item.qty, 0);
    const profit = grandTotal - totalCost;

    const result = createSale({
      customerId: selectedCustomerId || undefined,
      customerName: customCustomerName,
      items: itemsSnapshot,
      subtotal,
      discount: discountValue,
      discountType,
      discountAmount,
      grandTotal,
      totalCost,
      profit,
      paymentMethod,
      amountPaid: paymentMethod === 'TUNAI' ? cashGiven : grandTotal,
      change: paymentMethod === 'TUNAI' ? change : 0,
      status: 'COMPLETED',
      notes: transactionNotes || undefined,
    });

    if (result.success && result.sale) {
      clearCart();
      onSaleSuccess(result.sale.id);
    } else {
      setErrorMessage(result.error || 'Gagal menyimpan transaksi penjualan.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT COLUMN: Product Catalog / Catalog Selector (7 cols) */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari part komputer, tinta, kertas, jasa percetakan, atau scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeCategoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Katalog ({filteredItems.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('computer')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeCategoryFilter === 'computer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Part &amp; Aksesoris Komputer
            </button>
            <button
              onClick={() => setActiveCategoryFilter('printing_supply')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeCategoryFilter === 'printing_supply'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Perlengkapan Percetakan
            </button>
            <button
              onClick={() => setActiveCategoryFilter('services')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeCategoryFilter === 'services'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Jasa Percetakan (Print, Jilid, dll)
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-17rem)] pr-1">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">Barang atau jasa tidak ditemukan.</p>
              <p className="text-xs mt-1">Coba kata kunci lain atau bersihkan pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const isOutOfStock = item.type === 'product' && item.stock <= 0;
                const isService = item.type === 'service';

                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    disabled={isOutOfStock}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between relative group ${
                      isOutOfStock
                        ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-sm active:scale-[0.99] cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isService
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isService ? 'JASA' : item.categoryName}
                        </span>
                        {!isService && (
                          <span
                            className={`text-[10px] font-semibold ${
                              item.stock <= 2 ? 'text-amber-600' : 'text-slate-400'
                            }`}
                          >
                            Stok: {item.stock} {item.unit}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.code}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-600">
                        {formatRupiah(item.sellPrice)}
                        <span className="text-[10px] font-normal text-slate-400">/{item.unit}</span>
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart & Checkout (5 cols) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
        {/* Header: Customer Selector & Clear */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Keranjang Kasir</h2>
              <span className="text-[11px] text-slate-400">{cart.length} jenis item</span>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Customer Select */}
        <div className="mt-3 flex items-center gap-2">
          <div className="w-full">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Pelanggan
            </label>
            <select
              value={selectedCustomerId}
              onChange={handleCustomerChange}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Pelanggan Umum (Tanpa Data)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto max-h-72 my-3 divide-y divide-slate-100 pr-1">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingCart className="w-10 h-10 mx-auto text-slate-200 mb-2" />
              <p className="text-xs font-medium">Keranjang kasir masih kosong.</p>
              <p className="text-[11px] mt-0.5">Pilih produk atau jasa di sebelah kiri.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1 rounded ${
                        item.type === 'service' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.type === 'service' ? 'JASA' : 'PART'}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 truncate">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {formatRupiah(item.sellPrice)} x {item.qty} {item.unit}
                  </p>
                </div>

                {/* Qty controller */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                    className="w-10 text-center text-xs font-bold border border-slate-200 rounded py-0.5 focus:outline-none"
                  />
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right pl-2 min-w-[70px]">
                  <p className="text-xs font-bold text-slate-800">
                    {formatRupiah(item.subtotal)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[11px] text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Calculation Summary */}
        <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold font-mono">{formatRupiah(subtotal)}</span>
          </div>

          {/* Diskon controller */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-600">Diskon</span>
            <div className="flex items-center gap-1.5">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'nominal' | 'percent')}
                className="text-[11px] border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50"
              >
                <option value="nominal">Rp</option>
                <option value="percent">%</option>
              </select>
              <input
                type="number"
                min="0"
                value={discountValue || ''}
                placeholder="0"
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="w-20 text-right px-2 py-0.5 text-xs border border-slate-200 rounded font-mono"
              />
              {discountAmount > 0 && (
                <span className="text-red-600 font-medium">
                  (-{formatRupiah(discountAmount)})
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
            <span>TOTAL BAYAR</span>
            <span className="text-base text-blue-600 font-mono">
              {formatRupiah(grandTotal)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-3 pt-3 border-t border-slate-200">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setPaymentMethod('TUNAI');
                if (cashGiven === 0) setCashGiven(grandTotal);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                paymentMethod === 'TUNAI'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Tunai</span>
            </button>
            <button
              onClick={() => {
                setPaymentMethod('TRANSFER');
                setCashGiven(grandTotal);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                paymentMethod === 'TRANSFER'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
            <button
              onClick={() => {
                setPaymentMethod('QRIS');
                setCashGiven(grandTotal);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                paymentMethod === 'QRIS'
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QRIS</span>
            </button>
          </div>

          {/* Cash input & quick presets */}
          {paymentMethod === 'TUNAI' && (
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Uang Diterima:</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={cashGiven || ''}
                  placeholder="Rp 0"
                  onChange={(e) => setCashGiven(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-1.5 text-sm font-bold border border-slate-300 rounded-lg text-right font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={setExactCash}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  Uang Pas
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCash(20000)}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  20k
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCash(50000)}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  50k
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCash(100000)}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  100k
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCash(200000)}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  200k
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCash(500000)}
                  className="text-[10px] font-semibold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  500k
                </button>
              </div>

              {/* Change display */}
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Kembalian:</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  {formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {/* QRIS Graphic Preview */}
          {paymentMethod === 'QRIS' && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
              <div className="w-24 h-24 mx-auto bg-white border border-slate-300 rounded p-1 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-slate-900" />
              </div>
              <p className="text-[11px] font-bold text-slate-800">
                QRIS Dinamis Toko: {formatRupiah(grandTotal)}
              </p>
              <p className="text-[10px] text-slate-500">
                Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, BRI
              </p>
            </div>
          )}
        </div>

        {/* Submit Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0}
          className={`mt-4 w-full py-3 rounded-xl font-bold text-sm text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
            cart.length === 0
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>SIMPAN TRANSAKSI &amp; CETAK STRUK</span>
        </button>
      </div>
    </div>
  );
};
