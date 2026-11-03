import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  FolderTree,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Database,
} from 'lucide-react';

export const PythonGuideModal: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const requirementsTxt = `Flask==3.0.2
Flask-SQLAlchemy==3.1.1
Werkzeug==3.0.1
openpyxl==3.1.2
reportlab==4.1.0
python-dotenv==1.0.1`;

  const windowsRunCommands = `# 1. Buka folder proyek di Visual Studio Code (Terminal PowerShell atau CMD)
cd python-store-management

# 2. Buat Python Virtual Environment (venv)
python -m venv venv

# 3. Aktifkan Virtual Environment
# Di Windows PowerShell:
.\\venv\\Scripts\\Activate.ps1
# Atau jika menggunakan Command Prompt (cmd.exe):
.\\venv\\Scripts\\activate.bat

# 4. Install seluruh dependensi yang dibutuhkan
pip install -r requirements.txt

# 5. Jalankan aplikasi SI TOKO Flask
python app.py

# 6. Buka browser di http://localhost:5000`;

  const appPyCode = `"""
SI TOKO - Manajemen Part Komputer & Percetakan
Backend Python Flask + SQLite
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'si-toko-super-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sitoko.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    barcode = db.Column(db.String(50), index=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    brand = db.Column(db.String(100))
    spec = db.Column(db.Text)
    unit = db.Column(db.String(20), default='pcs')
    buy_price = db.Column(db.Integer, nullable=False, default=0)
    sell_price = db.Column(db.Integer, nullable=False, default=0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    min_stock = db.Column(db.Integer, default=3)
    location = db.Column(db.String(100))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), default='computer') # 'computer', 'printing_supply', 'service'
    description = db.Column(db.String(255))

class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    unit = db.Column(db.String(20), default='lembar')
    cost_price = db.Column(db.Integer, default=0)
    sell_price = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    notes = db.Column(db.String(255))

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    invoice_no = db.Column(db.String(50), unique=True, nullable=False, index=True)
    date = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    customer_name = db.Column(db.String(100), default='Pelanggan Umum')
    subtotal = db.Column(db.Integer, default=0)
    discount_amount = db.Column(db.Integer, default=0)
    grand_total = db.Column(db.Integer, default=0)
    total_cost = db.Column(db.Integer, default=0)
    profit = db.Column(db.Integer, default=0)
    payment_method = db.Column(db.String(30), default='TUNAI')
    amount_paid = db.Column(db.Integer, default=0)
    change = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='COMPLETED')

class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'))
    item_type = db.Column(db.String(20)) # 'product' / 'service'
    product_id = db.Column(db.Integer, nullable=True)
    code = db.Column(db.String(50))
    name = db.Column(db.String(150))
    unit = db.Column(db.String(20))
    qty = db.Column(db.Integer, default=1)
    buy_price = db.Column(db.Integer, default=0)
    sell_price = db.Column(db.Integer, default=0)
    subtotal = db.Column(db.Integer, default=0)
    profit = db.Column(db.Integer, default=0)

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'))
    movement_type = db.Column(db.String(20)) # 'IN', 'OUT', 'ADJUST', 'SALE', 'PURCHASE'
    quantity = db.Column(db.Integer, nullable=False)
    before_stock = db.Column(db.Integer)
    after_stock = db.Column(db.Integer)
    reason = db.Column(db.String(255))
    reference_no = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.Column(db.String(50), default='Admin')

# ==================== CONTROLLER ROUTES ====================

@app.route('/')
def dashboard():
    total_products = Product.query.count()
    total_stock = db.session.query(db.func.sum(Product.stock)).scalar() or 0
    today = datetime.utcnow().date()
    today_sales = Sale.query.filter(db.func.date(Sale.date) == today, Sale.status == 'COMPLETED').all()
    today_revenue = sum(s.grand_total for s in today_sales)
    today_profit = sum(s.profit for s in today_sales)
    low_stock_items = Product.query.filter(Product.stock <= Product.min_stock).all()
    return jsonify({
        "status": "online",
        "total_products": total_products,
        "total_stock": total_stock,
        "today_revenue": today_revenue,
        "today_profit": today_profit,
        "low_stock_count": len(low_stock_items)
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("SI TOKO Flask Server running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Panduan Python Flask &amp; VS Code Windows
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Struktur proyek modular Python Flask, SQLite, requirements.txt, dan langkah menjalankan di Visual Studio Code.
        </p>
      </div>

      {/* Steps to run on Windows */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Langkah Menjalankan di Windows (VS Code)
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(windowsRunCommands, 'run_cmd')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            {copiedKey === 'run_cmd' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Perintah</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
          {windowsRunCommands}
        </pre>
      </div>

      {/* requirements.txt */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              File requirements.txt
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(requirementsTxt, 'req_txt')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            {copiedKey === 'req_txt' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin requirements.txt</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
          {requirementsTxt}
        </pre>
      </div>

      {/* app.py code view */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Arsitektur Python Backend (app.py &amp; SQLite Schema)
            </h2>
          </div>
          <button
            onClick={() => copyToClipboard(appPyCode, 'app_py')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
          >
            {copiedKey === 'app_py' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Kode Python</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed">
          {appPyCode}
        </pre>
      </div>
    </div>
  );
};
