import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { PosView } from './components/PosView.js';
import { ProductsView } from './components/ProductsView.js';
import { PriceManagementView } from './components/PriceManagementView.js';
import { StockManagementView } from './components/StockManagementView.js';
import { ServicesView } from './components/ServicesView.js';
import { PurchasesView } from './components/PurchasesView.js';
import { SuppliersCustomersView } from './components/SuppliersCustomersView.js';
import { ReportsView } from './components/ReportsView.js';
import { SettingsView } from './components/SettingsView.js';
import { ReceiptModal } from './components/ReceiptModal.js';
import { PythonGuideModal } from './components/PythonGuideModal.js';
import { Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [receiptSaleId, setReceiptSaleId] = useState<string | null>(null);

  const handleSaleSuccess = (saleId: string) => {
    setReceiptSaleId(saleId);
  };

  const handleOpenReceipt = (saleId: string) => {
    setReceiptSaleId(saleId);
  };

  return (
    <StoreProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openReceiptModal={() => receiptSaleId && setReceiptSaleId(receiptSaleId)}
        />

        {/* Mobile menu bar trigger */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between no-print">
          <button
            onClick={() => setIsOpenMobile(true)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
          >
            <Menu className="w-4 h-4 text-slate-600" />
            <span>Menu SI TOKO</span>
          </button>
          <span className="text-xs font-bold text-blue-600 uppercase">
            {activeTab.replace('-', ' ')}
          </span>
        </div>

        {/* Main Body with Sidebar + Content */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpenMobile={isOpenMobile}
            setIsOpenMobile={setIsOpenMobile}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                openReceiptModal={handleOpenReceipt}
              />
            )}
            {activeTab === 'pos' && (
              <PosView onSaleSuccess={handleSaleSuccess} />
            )}
            {activeTab === 'products' && <ProductsView />}
            {activeTab === 'pricing' && <PriceManagementView />}
            {activeTab === 'stock' && <StockManagementView />}
            {activeTab === 'services' && (
              <ServicesView setActiveTab={setActiveTab} />
            )}
            {activeTab === 'purchases' && <PurchasesView />}
            {activeTab === 'partners' && <SuppliersCustomersView />}
            {activeTab === 'reports' && (
              <ReportsView openReceiptModal={handleOpenReceipt} />
            )}
            {activeTab === 'settings' && <SettingsView />}
            {activeTab === 'python-guide' && <PythonGuideModal />}
          </main>
        </div>

        {/* Receipt Modal (Thermal Print) */}
        <ReceiptModal
          saleId={receiptSaleId}
          onClose={() => setReceiptSaleId(null)}
        />
      </div>
    </StoreProvider>
  );
}
