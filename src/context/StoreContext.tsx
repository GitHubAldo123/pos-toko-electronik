import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  ServiceItem,
  Supplier,
  Customer,
  StoreSettings,
  Sale,
  StockMovement,
  PriceHistory,
  Purchase,
  MovementType,
} from '../types/index.js';
import {
  initialSettings,
  initialCategories,
  initialSuppliers,
  initialCustomers,
  initialProducts,
  initialServices,
  initialSales,
  initialPurchases,
  initialStockMovements,
  initialPriceHistories,
} from '../data/initialData.js';

interface StoreContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => boolean;

  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;
  updateProductPrice: (
    id: string,
    newBuyPrice: number,
    newSellPrice: number,
    reason: string
  ) => void;
  batchUpdatePrices: (
    updates: { id: string; newBuyPrice: number; newSellPrice: number }[],
    reason: string
  ) => void;

  services: ServiceItem[];
  addService: (service: Omit<ServiceItem, 'id'>) => ServiceItem;
  updateService: (id: string, service: Partial<ServiceItem>) => void;
  deleteService: (id: string) => boolean;

  stockMovements: StockMovement[];
  adjustStock: (
    productId: string,
    type: 'IN' | 'OUT' | 'ADJUST',
    quantity: number,
    reason: string,
    user?: string
  ) => boolean;

  sales: Sale[];
  createSale: (
    saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date'>
  ) => { success: boolean; sale?: Sale; error?: string };
  cancelSale: (saleId: string, reason: string) => boolean;

  purchases: Purchase[];
  createPurchase: (
    purchaseData: Omit<Purchase, 'id' | 'purchaseNo' | 'date'>
  ) => Purchase;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => boolean;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  priceHistories: PriceHistory[];

  resetToDefaultData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'SI_TOKO_DATA_V1';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
      return saved ? JSON.parse(saved) : initialServices;
    } catch {
      return initialServices;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
      return saved ? JSON.parse(saved) : initialSuppliers;
    } catch {
      return initialSuppliers;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
      return saved ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_purchases`);
      return saved ? JSON.parse(saved) : initialPurchases;
    } catch {
      return initialPurchases;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
      return saved ? JSON.parse(saved) : initialStockMovements;
    } catch {
      return initialStockMovements;
    }
  });

  const [priceHistories, setPriceHistories] = useState<PriceHistory[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_price_history`);
      return saved ? JSON.parse(saved) : initialPriceHistories;
    } catch {
      return initialPriceHistories;
    }
  });

  // Auto save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_purchases`, JSON.stringify(purchases));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [purchases]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(stockMovements));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [stockMovements]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_price_history`, JSON.stringify(priceHistories));
    } catch (e) {
      console.warn('Storage save error', e);
    }
  }, [priceHistories]);

  // SETTINGS
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // CATEGORIES
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  const deleteCategory = (id: string): boolean => {
    // Check if products exist in category
    const hasProducts = products.some((p) => p.categoryId === id);
    const hasServices = services.some((s) => s.categoryId === id);
    if (hasProducts || hasServices) {
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // PRODUCTS
  const addProduct = (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Product => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Record initial stock if > 0
    if (newProduct.stock > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        productId: newProduct.id,
        productCode: newProduct.code,
        productName: newProduct.name,
        type: 'IN',
        quantity: newProduct.stock,
        beforeStock: 0,
        afterStock: newProduct.stock,
        reason: 'Stok awal penambahan produk baru',
        timestamp: now,
        user: 'Admin',
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updatedAt: now,
          };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string): boolean => {
    const target = products.find((p) => p.id === id);
    if (!target) return false;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  const updateProductPrice = (
    id: string,
    newBuyPrice: number,
    newSellPrice: number,
    reason: string
  ) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const oldBuyPrice = product.buyPrice;
    const oldSellPrice = product.sellPrice;

    // Only record if price actually changed
    if (oldBuyPrice !== newBuyPrice || oldSellPrice !== newSellPrice) {
      const historyEntry: PriceHistory = {
        id: `prch-${Date.now()}`,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        oldBuyPrice,
        newBuyPrice,
        oldSellPrice,
        newSellPrice,
        reason: reason || 'Penyesuaian harga manual',
        timestamp: new Date().toISOString(),
      };
      setPriceHistories((prev) => [historyEntry, ...prev]);
    }

    updateProduct(id, { buyPrice: newBuyPrice, sellPrice: newSellPrice });
  };

  const batchUpdatePrices = (
    updates: { id: string; newBuyPrice: number; newSellPrice: number }[],
    reason: string
  ) => {
    const now = new Date().toISOString();
    const newHistories: PriceHistory[] = [];

    setProducts((prev) =>
      prev.map((p) => {
        const update = updates.find((u) => u.id === p.id);
        if (update) {
          if (p.buyPrice !== update.newBuyPrice || p.sellPrice !== update.newSellPrice) {
            newHistories.push({
              id: `prch-${Date.now()}-${p.id}`,
              productId: p.id,
              productCode: p.code,
              productName: p.name,
              oldBuyPrice: p.buyPrice,
              newBuyPrice: update.newBuyPrice,
              oldSellPrice: p.sellPrice,
              newSellPrice: update.newSellPrice,
              reason: reason || 'Update harga massal',
              timestamp: now,
            });
          }
          return {
            ...p,
            buyPrice: update.newBuyPrice,
            sellPrice: update.newSellPrice,
            updatedAt: now,
          };
        }
        return p;
      })
    );

    if (newHistories.length > 0) {
      setPriceHistories((prev) => [...newHistories, ...prev]);
    }
  };

  // SERVICES
  const addService = (serviceData: Omit<ServiceItem, 'id'>): ServiceItem => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [newService, ...prev]);
    return newService;
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string): boolean => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  // STOCK ADJUSTMENT
  const adjustStock = (
    productId: string,
    type: 'IN' | 'OUT' | 'ADJUST',
    quantity: number,
    reason: string,
    user: string = 'Petugas Toko'
  ): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const beforeStock = product.stock;
    let afterStock = beforeStock;

    if (type === 'IN') {
      afterStock = beforeStock + Math.abs(quantity);
    } else if (type === 'OUT') {
      afterStock = Math.max(0, beforeStock - Math.abs(quantity));
    } else if (type === 'ADJUST') {
      // Direct count opname
      afterStock = Math.max(0, quantity);
    }

    const delta = afterStock - beforeStock;

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      type,
      quantity: delta,
      beforeStock,
      afterStock,
      reason: reason || (type === 'ADJUST' ? 'Hasil Stok Opname Fisik' : 'Penyesuaian Stok Manual'),
      timestamp: new Date().toISOString(),
      user,
    };

    updateProduct(productId, { stock: afterStock });
    setStockMovements((prev) => [movement, ...prev]);
    return true;
  };

  // POS SALES TRANSACTION
  const createSale = (
    saleData: Omit<Sale, 'id' | 'invoiceNo' | 'date'>
  ): { success: boolean; sale?: Sale; error?: string } => {
    // 1. Validate product stocks
    for (const item of saleData.items) {
      if (item.type === 'product') {
        const prod = products.find((p) => p.id === item.itemId);
        if (!prod) {
          return {
            success: false,
            error: `Produk ${item.name} tidak ditemukan di sistem database.`,
          };
        }
        if (prod.stock < item.qty) {
          return {
            success: false,
            error: `Stok produk "${prod.name}" tidak mencukupi (Tersedia: ${prod.stock}, Diminta: ${item.qty}).`,
          };
        }
      }
    }

    const now = new Date();
    const dateStr = now.toISOString();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const invoiceNo = `${settings.invoicePrefix || 'TRX'}-${ymd}-${randomSuffix}`;

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: dateStr,
    };

    // 2. Decrement stocks and log movements
    const movementsToAdd: StockMovement[] = [];
    const productUpdates: Record<string, number> = {};

    for (const item of saleData.items) {
      if (item.type === 'product') {
        const prod = products.find((p) => p.id === item.itemId)!;
        const currentStock = productUpdates[prod.id] !== undefined ? productUpdates[prod.id] : prod.stock;
        const nextStock = currentStock - item.qty;
        productUpdates[prod.id] = nextStock;

        movementsToAdd.push({
          id: `mov-${Date.now()}-${item.itemId}`,
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          type: 'SALE',
          quantity: -item.qty,
          beforeStock: currentStock,
          afterStock: nextStock,
          reason: `Penjualan POS #${invoiceNo} (${newSale.customerName})`,
          referenceNo: invoiceNo,
          timestamp: dateStr,
          user: 'Kasir',
        });
      } else if (item.type === 'service') {
        // If service has linked supply product configured
        const srv = services.find((s) => s.id === item.itemId);
        if (srv?.linkedSupplyProductId && srv.supplyUsagePerUnit) {
          const supplyProd = products.find((p) => p.id === srv.linkedSupplyProductId);
          if (supplyProd) {
            const usage = Math.round(srv.supplyUsagePerUnit * item.qty);
            if (usage > 0) {
              const currentStock =
                productUpdates[supplyProd.id] !== undefined
                  ? productUpdates[supplyProd.id]
                  : supplyProd.stock;
              const nextStock = Math.max(0, currentStock - usage);
              productUpdates[supplyProd.id] = nextStock;

              movementsToAdd.push({
                id: `mov-${Date.now()}-${supplyProd.id}`,
                productId: supplyProd.id,
                productCode: supplyProd.code,
                productName: supplyProd.name,
                type: 'OUT',
                quantity: -usage,
                beforeStock: currentStock,
                afterStock: nextStock,
                reason: `Pemakaian bahan untuk jasa ${srv.name} (${invoiceNo})`,
                referenceNo: invoiceNo,
                timestamp: dateStr,
                user: 'Percetakan',
              });
            }
          }
        }
      }
    }

    // Apply product updates
    setProducts((prev) =>
      prev.map((p) => {
        if (productUpdates[p.id] !== undefined) {
          return {
            ...p,
            stock: productUpdates[p.id],
            updatedAt: dateStr,
          };
        }
        return p;
      })
    );

    // Apply movements
    if (movementsToAdd.length > 0) {
      setStockMovements((prev) => [...movementsToAdd, ...prev]);
    }

    // Update customer stats if selected
    if (newSale.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            return {
              ...c,
              totalOrders: (c.totalOrders || 0) + 1,
              totalSpent: (c.totalSpent || 0) + newSale.grandTotal,
            };
          }
          return c;
        })
      );
    }

    // Save sale
    setSales((prev) => [newSale, ...prev]);

    return { success: true, sale: newSale };
  };

  // CANCEL SALE / RETUR
  const cancelSale = (saleId: string, reason: string): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'CANCELLED') return false;

    const now = new Date().toISOString();
    const movementsToAdd: StockMovement[] = [];
    const productUpdates: Record<string, number> = {};

    // Revert stocks for product items
    for (const item of sale.items) {
      if (item.type === 'product') {
        const prod = products.find((p) => p.id === item.itemId);
        if (prod) {
          const currentStock =
            productUpdates[prod.id] !== undefined ? productUpdates[prod.id] : prod.stock;
          const nextStock = currentStock + item.qty;
          productUpdates[prod.id] = nextStock;

          movementsToAdd.push({
            id: `mov-${Date.now()}-${item.itemId}`,
            productId: prod.id,
            productCode: prod.code,
            productName: prod.name,
            type: 'RETURN',
            quantity: item.qty,
            beforeStock: currentStock,
            afterStock: nextStock,
            reason: `Pembatalan/Retur Transaksi #${sale.invoiceNo}: ${reason}`,
            referenceNo: sale.invoiceNo,
            timestamp: now,
            user: 'Admin/Kasir',
          });
        }
      }
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (productUpdates[p.id] !== undefined) {
          return {
            ...p,
            stock: productUpdates[p.id],
            updatedAt: now,
          };
        }
        return p;
      })
    );

    if (movementsToAdd.length > 0) {
      setStockMovements((prev) => [...movementsToAdd, ...prev]);
    }

    // Mark sale as cancelled
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId ? { ...s, status: 'CANCELLED', notes: `${s.notes ? s.notes + ' | ' : ''}Dibatalkan: ${reason}` } : s
      )
    );

    return true;
  };

  // PURCHASES
  const createPurchase = (
    purchaseData: Omit<Purchase, 'id' | 'purchaseNo' | 'date'>
  ): Purchase => {
    const now = new Date();
    const dateStr = now.toISOString();
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const purchaseNo = `PO-${ymd}-${randomSuffix}`;

    const newPurchase: Purchase = {
      ...purchaseData,
      id: `po-${Date.now()}`,
      purchaseNo,
      date: dateStr,
    };

    // Auto increment product stocks and record movements
    const movementsToAdd: StockMovement[] = [];
    const productUpdates: Record<string, number> = {};

    for (const item of purchaseData.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const currentStock =
          productUpdates[prod.id] !== undefined ? productUpdates[prod.id] : prod.stock;
        const nextStock = currentStock + item.qty;
        productUpdates[prod.id] = nextStock;

        movementsToAdd.push({
          id: `mov-${Date.now()}-${item.productId}`,
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          type: 'PURCHASE',
          quantity: item.qty,
          beforeStock: currentStock,
          afterStock: nextStock,
          reason: `Pembelian dari ${newPurchase.supplierName} (#${purchaseNo})`,
          referenceNo: purchaseNo,
          timestamp: dateStr,
          user: 'Admin Pembelian',
        });
      }
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (productUpdates[p.id] !== undefined) {
          return {
            ...p,
            stock: productUpdates[p.id],
            updatedAt: dateStr,
          };
        }
        return p;
      })
    );

    if (movementsToAdd.length > 0) {
      setStockMovements((prev) => [...movementsToAdd, ...prev]);
    }

    // Update supplier total purchases
    if (newPurchase.supplierId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === newPurchase.supplierId) {
            return {
              ...s,
              totalPurchases: (s.totalPurchases || 0) + newPurchase.totalAmount,
            };
          }
          return s;
        })
      );
    }

    setPurchases((prev) => [newPurchase, ...prev]);
    return newPurchase;
  };

  // SUPPLIERS
  const addSupplier = (supplierData: Omit<Supplier, 'id'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSupplier = (id: string): boolean => {
    const hasProducts = products.some((p) => p.supplierId === id);
    if (hasProducts) return false;
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  // CUSTOMERS
  const addCustomer = (customerData: Omit<Customer, 'id'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = (id: string): boolean => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // RESET & BACKUP
  const resetToDefaultData = () => {
    setSettings(initialSettings);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setServices(initialServices);
    setSuppliers(initialSuppliers);
    setCustomers(initialCustomers);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setStockMovements(initialStockMovements);
    setPriceHistories(initialPriceHistories);

    localStorage.removeItem(`${STORAGE_KEY}_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_categories`);
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_services`);
    localStorage.removeItem(`${STORAGE_KEY}_suppliers`);
    localStorage.removeItem(`${STORAGE_KEY}_customers`);
    localStorage.removeItem(`${STORAGE_KEY}_sales`);
    localStorage.removeItem(`${STORAGE_KEY}_purchases`);
    localStorage.removeItem(`${STORAGE_KEY}_movements`);
    localStorage.removeItem(`${STORAGE_KEY}_price_history`);
  };

  const exportDatabaseJSON = (): string => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      categories,
      products,
      services,
      suppliers,
      customers,
      sales,
      purchases,
      stockMovements,
      priceHistories,
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.products || !data.settings) return false;

      if (data.settings) setSettings(data.settings);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.services) setServices(data.services);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.customers) setCustomers(data.customers);
      if (data.sales) setSales(data.sales);
      if (data.purchases) setPurchases(data.purchases);
      if (data.stockMovements) setStockMovements(data.stockMovements);
      if (data.priceHistories) setPriceHistories(data.priceHistories);

      return true;
    } catch {
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        categories,
        addCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductPrice,
        batchUpdatePrices,
        services,
        addService,
        updateService,
        deleteService,
        stockMovements,
        adjustStock,
        sales,
        createSale,
        cancelSale,
        purchases,
        createPurchase,
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        priceHistories,
        resetToDefaultData,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
