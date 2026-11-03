import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.js';
import { formatRupiah, formatNumber } from '../utils/money.js';
import { Printer, X, Check, Scissors } from 'lucide-react';

interface ReceiptModalProps {
  saleId: string | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ saleId, onClose }) => {
  const { sales, settings } = useStore();
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings.receiptPaperSize || '58mm');

  if (!saleId) return null;
  const sale = sales.find((s) => s.id === saleId);
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4 my-8">
        {/* Modal Controls (No Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Cetak Struk Penjualan</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paperWidth === '58mm' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                58 mm
              </button>
              <button
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paperWidth === '80mm' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                80 mm
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* THERMAL RECEIPT PREVIEW CANVAS */}
        <div className="bg-slate-100 p-4 sm:p-6 rounded-xl flex justify-center overflow-x-auto">
          <div
            id="thermal-receipt"
            className={`bg-white p-5 shadow-md border border-slate-200 text-slate-900 font-mono text-xs leading-relaxed transition-all ${
              paperWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
          >
            {/* Header Store Info */}
            <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-slate-400">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight uppercase">
                {settings.storeName}
              </h1>
              <p className="text-[11px] font-sans text-slate-600 leading-tight">
                {settings.tagline}
              </p>
              <p className="text-[10px] text-slate-600 leading-tight">
                {settings.address}
              </p>
              <p className="text-[10px] text-slate-600">
                Telp/WA: {settings.phone}
              </p>
            </div>

            {/* Transaction Metadata */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-bold">{sale.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(sale.date).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Petugas Shift</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{sale.customerName}</span>
              </div>
            </div>

            {/* Items List */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-2">
              {sale.items.map((item, idx) => (
                <div key={idx}>
                  <div className="font-bold text-slate-800 leading-tight">
                    {item.name}
                  </div>
                  <div className="flex justify-between text-slate-600 text-[10px] mt-0.5">
                    <span>
                      {item.qty} {item.unit} x {formatNumber(item.sellPrice)}
                    </span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatNumber(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatNumber(sale.subtotal)}</span>
              </div>

              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Diskon:</span>
                  <span>-{formatNumber(sale.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-bold pt-1 text-slate-900 border-t border-dotted border-slate-300">
                <span>TOTAL:</span>
                <span>{formatRupiah(sale.grandTotal)}</span>
              </div>

              <div className="flex justify-between pt-1">
                <span>Metode Bayar:</span>
                <span className="font-bold uppercase">{sale.paymentMethod}</span>
              </div>

              <div className="flex justify-between">
                <span>Bayar:</span>
                <span>{formatNumber(sale.amountPaid)}</span>
              </div>

              {sale.paymentMethod === 'TUNAI' && (
                <div className="flex justify-between font-bold">
                  <span>Kembalian:</span>
                  <span>{formatNumber(sale.change)}</span>
                </div>
              )}
            </div>

            {/* Footer Thank You */}
            <div className="pt-3 text-center space-y-1">
              <p className="text-[10px] text-slate-700 whitespace-pre-line leading-relaxed">
                {settings.receiptFooter}
              </p>
              <div className="pt-2 flex flex-col items-center justify-center">
                <span className="font-mono text-[9px] text-slate-400 tracking-widest">
                  * {sale.invoiceNo} *
                </span>
                <p className="text-[9px] text-slate-400 mt-0.5 font-sans">
                  Layanan Cetak &amp; Komputer Terpercaya
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Cut Decorative (No Print) */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 no-print">
          <Scissors className="w-3.5 h-3.5" />
          <span>Garis potong kertas thermal printer</span>
        </div>
      </div>
    </div>
  );
};
