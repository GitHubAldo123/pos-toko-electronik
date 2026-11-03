export type CategoryType = 'computer' | 'printing_supply' | 'service';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description?: string;
  isCustom?: boolean;
}

export type ProductUnit = 'pcs' | 'unit' | 'box' | 'rim' | 'pak' | 'botol' | 'roll' | 'lembar' | 'set';

export interface Product {
  id: string;
  code: string; // SKU e.g. "PRC-001"
  barcode?: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  categoryType: CategoryType;
  brand: string;
  spec: string;
  unit: ProductUnit;
  buyPrice: number; // Integer Rupiah
  sellPrice: number; // Integer Rupiah
  stock: number;
  minStock: number;
  location: string; // e.g. "Rak A-02"
  supplierId: string;
  supplierName?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceUnit = 'lembar' | 'halaman' | 'set' | 'paket' | 'meter' | 'unit' | 'buku';

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: ServiceUnit;
  costPrice: number; // Harga modal/bahan jika relevan
  sellPrice: number; // Harga jual per satuan
  isActive: boolean;
  notes?: string;
  // Optional configuration of material usage:
  linkedSupplyProductId?: string; // Product id of kertas/tinta
  supplyUsagePerUnit?: number; // e.g. 1 lembar kertas per print
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'PURCHASE' | 'RETURN';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: MovementType;
  quantity: number; // Positive change (or signed)
  beforeStock: number;
  afterStock: number;
  reason: string;
  referenceNo?: string; // Invoice No or Purchase No
  timestamp: string;
  user: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  oldBuyPrice: number;
  newBuyPrice: number;
  oldSellPrice: number;
  newSellPrice: number;
  reason: string;
  timestamp: string;
}

export interface CartItem {
  id: string; // unique cart line id
  type: 'product' | 'service';
  productId?: string;
  serviceId?: string;
  code: string;
  name: string;
  unit: string;
  buyPrice: number; // Snapshot of cost
  sellPrice: number; // Current selling price
  qty: number;
  subtotal: number;
  notes?: string;
}

export type PaymentMethod = 'TUNAI' | 'TRANSFER' | 'QRIS';

export interface SaleItemSnapshot {
  type: 'product' | 'service';
  itemId: string;
  code: string;
  name: string;
  unit: string;
  qty: number;
  buyPrice: number;
  sellPrice: number;
  subtotal: number;
  profit: number; // (sellPrice - buyPrice) * qty
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string; // ISO string
  customerId?: string;
  customerName: string;
  items: SaleItemSnapshot[];
  subtotal: number;
  discount: number;
  discountType: 'nominal' | 'percent';
  discountAmount: number;
  grandTotal: number;
  totalCost: number; // Sum of buyPrice * qty
  profit: number; // grandTotal - totalCost
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  code: string;
  name: string;
  unit: string;
  qty: number;
  buyPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paymentStatus: 'LUNAS' | 'HUTANG';
  dueDate?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  totalPurchases?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  receiptFooter: string;
  receiptPaperSize: '58mm' | '80mm';
  invoicePrefix: string;
  defaultMinStock: number;
  currencySymbol: string;
  taxPercent: number; // default 0%
}
