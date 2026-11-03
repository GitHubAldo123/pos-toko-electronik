"""
SI TOKO - Manajemen Part Komputer & Percetakan
Backend Python Flask + MySQL (PyMySQL) / SQLite
"""

import os
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config.Config')
db = SQLAlchemy(app)

# ==================== DATABASE MODELS ====================

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), default='computer')  # 'computer', 'printing_supply', 'service'
    description = db.Column(db.String(255))
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    barcode = db.Column(db.String(50), index=True)
    name = db.Column(db.String(150), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    brand = db.Column(db.String(100))
    spec = db.Column(db.Text)
    unit = db.Column(db.String(20), default='pcs')
    buy_price = db.Column(db.Integer, nullable=False, default=0)
    sell_price = db.Column(db.Integer, nullable=False, default=0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    min_stock = db.Column(db.Integer, default=3)
    location = db.Column(db.String(100))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "code": self.code,
            "barcode": self.barcode,
            "name": self.name,
            "category_id": self.category_id,
            "brand": self.brand,
            "unit": self.unit,
            "buy_price": self.buy_price,
            "sell_price": self.sell_price,
            "stock": self.stock,
            "min_stock": self.min_stock,
            "margin_percent": round(((self.sell_price - self.buy_price) / self.sell_price * 100), 1) if self.sell_price > 0 else 0
        }

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

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(50))
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    notes = db.Column(db.Text)

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(50))
    address = db.Column(db.Text)
    notes = db.Column(db.Text)

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
    items = db.relationship('SaleItem', backref='sale', lazy=True)

class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    item_type = db.Column(db.String(20))
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
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.String(20))
    quantity = db.Column(db.Integer, nullable=False)
    before_stock = db.Column(db.Integer)
    after_stock = db.Column(db.Integer)
    reason = db.Column(db.String(255))
    reference_no = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.Column(db.String(50), default='Admin')

# ==================== ROUTES & APIS ====================

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_data():
    total_products = Product.query.count()
    total_stock = db.session.query(db.func.sum(Product.stock)).scalar() or 0
    today = datetime.utcnow().date()
    today_sales = Sale.query.filter(db.func.date(Sale.date) == today, Sale.status == 'COMPLETED').all()
    today_revenue = sum(s.grand_total for s in today_sales)
    today_profit = sum(s.profit for s in today_sales)
    low_stock = Product.query.filter(Product.stock <= Product.min_stock).count()

    return jsonify({
        "success": True,
        "total_products": total_products,
        "total_stock": total_stock,
        "today_revenue": today_revenue,
        "today_profit": today_profit,
        "low_stock_count": low_stock,
        "today_transactions": len(today_sales)
    })

@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'POST':
        data = request.json
        prod = Product(
            code=data['code'],
            barcode=data.get('barcode'),
            name=data['name'],
            category_id=data['category_id'],
            brand=data.get('brand'),
            spec=data.get('spec'),
            unit=data.get('unit', 'pcs'),
            buy_price=int(data.get('buy_price', 0)),
            sell_price=int(data.get('sell_price', 0)),
            stock=int(data.get('stock', 0)),
            min_stock=int(data.get('min_stock', 3)),
            location=data.get('location')
        )
        db.session.add(prod)
        db.session.commit()
        return jsonify({"success": True, "product": prod.to_dict()}), 201

    products = Product.query.all()
    return jsonify({"success": True, "products": [p.to_dict() for p in products]})

@app.route('/api/checkout', methods=['POST'])
def pos_checkout():
    data = request.json
    items = data.get('items', [])
    if not items:
        return jsonify({"success": False, "error": "Keranjang kosong"}), 400

    now = datetime.utcnow()
    inv_no = f"TRX-{now.strftime('%Y%m%d')}-{int(now.timestamp()) % 1000:03d}"

    subtotal = 0
    total_cost = 0

    sale_items = []
    # Begin transaction
    try:
        for item in items:
            prod = Product.query.get(item['product_id'])
            if not prod or prod.stock < item['qty']:
                db.session.rollback()
                return jsonify({"success": False, "error": f"Stok barang {item.get('name')} tidak mencukupi"}), 400

            # Deduct stock
            before = prod.stock
            prod.stock -= item['qty']
            after = prod.stock

            item_subtotal = item['qty'] * prod.sell_price
            item_cost = item['qty'] * prod.buy_price
            item_profit = item_subtotal - item_cost

            subtotal += item_subtotal
            total_cost += item_cost

            sale_item = SaleItem(
                item_type='product',
                product_id=prod.id,
                code=prod.code,
                name=prod.name,
                unit=prod.unit,
                qty=item['qty'],
                buy_price=prod.buy_price,
                sell_price=prod.sell_price,
                subtotal=item_subtotal,
                profit=item_profit
            )
            sale_items.append(sale_item)

            # Movement log
            mov = StockMovement(
                product_id=prod.id,
                movement_type='SALE',
                quantity=-item['qty'],
                before_stock=before,
                after_stock=after,
                reason=f"Penjualan POS #{inv_no}",
                reference_no=inv_no,
                user="Kasir"
            )
            db.session.add(mov)

        discount_amount = int(data.get('discount_amount', 0))
        grand_total = max(0, subtotal - discount_amount)
        profit = grand_total - total_cost

        sale = Sale(
            invoice_no=inv_no,
            date=now,
            customer_name=data.get('customer_name', 'Pelanggan Umum'),
            subtotal=subtotal,
            discount_amount=discount_amount,
            grand_total=grand_total,
            total_cost=total_cost,
            profit=profit,
            payment_method=data.get('payment_method', 'TUNAI'),
            amount_paid=int(data.get('amount_paid', grand_total)),
            change=max(0, int(data.get('amount_paid', grand_total)) - grand_total),
            status='COMPLETED'
        )
        db.session.add(sale)
        db.session.flush()

        for s_item in sale_items:
            s_item.sale_id = sale.id
            db.session.add(s_item)

        db.session.commit()
        return jsonify({"success": True, "invoice_no": inv_no, "grand_total": grand_total})

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("SI TOKO Flask Application ready on http://localhost:5000")
    app.run(debug=True, port=5000)
