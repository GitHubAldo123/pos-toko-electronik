import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  FileText,
  Copy,
  Check,
  Download,
  Database,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const PythonGuideModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'python' | 'vscode'>('mysql');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const mysqlScript = `-- =====================================================================
-- SI TOKO - SISTEM INFORMASI MANAJEMEN PART KOMPUTER & PERCETAKAN
-- DATABASE SCHEMA & SEED DATA UNTUK MYSQL (InnoDB, utf8mb4)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS \`si_toko\` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE \`si_toko\`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL PENGATURAN TOKO (settings)
DROP TABLE IF EXISTS \`settings\`;
CREATE TABLE \`settings\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`store_name\` VARCHAR(150) NOT NULL DEFAULT 'SI TOKO COMPUTER & PERCETAKAN',
  \`tagline\` VARCHAR(255) DEFAULT 'Solusi Lengkap Hardware Komputer, Aksesoris & Digital Printing',
  \`address\` TEXT NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`receipt_footer\` TEXT DEFAULT NULL,
  \`receipt_paper_size\` ENUM('58mm', '80mm') DEFAULT '58mm',
  \`invoice_prefix\` VARCHAR(10) DEFAULT 'TRX',
  \`default_min_stock\` INT UNSIGNED DEFAULT 3,
  \`currency_symbol\` VARCHAR(10) DEFAULT 'Rp',
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL PENGGUNA (users)
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`full_name\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin', 'kasir', 'operator') NOT NULL DEFAULT 'kasir',
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL KATEGORI (categories)
DROP TABLE IF EXISTS \`categories\`;
CREATE TABLE \`categories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(50) DEFAULT NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`type\` ENUM('computer', 'printing_supply', 'service') NOT NULL DEFAULT 'computer',
  \`description\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_category_type\` (\`type\`),
  INDEX \`idx_category_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL SUPPLIER (suppliers)
DROP TABLE IF EXISTS \`suppliers\`;
CREATE TABLE \`suppliers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`address\` TEXT NOT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`total_purchases\` BIGINT UNSIGNED DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_supplier_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL PELANGGAN (customers)
DROP TABLE IF EXISTS \`customers\`;
CREATE TABLE \`customers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`phone\` VARCHAR(50) NOT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`total_orders\` INT UNSIGNED DEFAULT 0,
  \`total_spent\` BIGINT UNSIGNED DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_customer_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL PRODUK BARANG (products)
DROP TABLE IF EXISTS \`products\`;
CREATE TABLE \`products\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(50) NOT NULL UNIQUE,
  \`barcode\` VARCHAR(50) DEFAULT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`brand\` VARCHAR(100) DEFAULT NULL,
  \`spec\` TEXT DEFAULT NULL,
  \`unit\` VARCHAR(20) NOT NULL DEFAULT 'pcs',
  \`buy_price\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`sell_price\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`min_stock\` INT UNSIGNED NOT NULL DEFAULT 3,
  \`location\` VARCHAR(100) DEFAULT NULL,
  \`supplier_id\` INT UNSIGNED DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_products_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_products_supplier\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_prod_code\` (\`code\`),
  INDEX \`idx_prod_barcode\` (\`barcode\`),
  INDEX \`idx_prod_name\` (\`name\`),
  INDEX \`idx_prod_stock\` (\`stock\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL JASA PERCETAKAN (services)
DROP TABLE IF EXISTS \`services\`;
CREATE TABLE \`services\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`code\` VARCHAR(50) NOT NULL UNIQUE,
  \`name\` VARCHAR(150) NOT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`unit\` VARCHAR(20) NOT NULL DEFAULT 'lembar',
  \`cost_price\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`sell_price\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`notes\` VARCHAR(255) DEFAULT NULL,
  \`linked_supply_product_id\` INT UNSIGNED DEFAULT NULL,
  \`supply_usage_per_unit\` DECIMAL(10,2) DEFAULT NULL,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_services_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT,
  INDEX \`idx_service_code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABEL RIWAYAT HARGA (price_histories)
DROP TABLE IF EXISTS \`price_histories\`;
CREATE TABLE \`price_histories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`product_code\` VARCHAR(50) NOT NULL,
  \`product_name\` VARCHAR(150) NOT NULL,
  \`old_buy_price\` BIGINT UNSIGNED NOT NULL,
  \`new_buy_price\` BIGINT UNSIGNED NOT NULL,
  \`old_sell_price\` BIGINT UNSIGNED NOT NULL,
  \`new_sell_price\` BIGINT UNSIGNED NOT NULL,
  \`reason\` VARCHAR(255) NOT NULL,
  \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_price_hist_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABEL MUTASI STOK (stock_movements)
DROP TABLE IF EXISTS \`stock_movements\`;
CREATE TABLE \`stock_movements\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`product_id\` INT UNSIGNED NOT NULL,
  \`movement_type\` ENUM('IN', 'OUT', 'ADJUST', 'SALE', 'PURCHASE', 'RETURN') NOT NULL,
  \`quantity\` INT NOT NULL,
  \`before_stock\` INT NOT NULL,
  \`after_stock\` INT NOT NULL,
  \`reason\` VARCHAR(255) NOT NULL,
  \`reference_no\` VARCHAR(50) DEFAULT NULL,
  \`user\` VARCHAR(50) DEFAULT 'Admin',
  \`timestamp\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_stock_mov_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_mov_product\` (\`product_id\`),
  INDEX \`idx_mov_time\` (\`timestamp\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABEL PENJUALAN (sales)
DROP TABLE IF EXISTS \`sales\`;
CREATE TABLE \`sales\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`invoice_no\` VARCHAR(50) NOT NULL UNIQUE,
  \`date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`customer_id\` INT UNSIGNED DEFAULT NULL,
  \`customer_name\` VARCHAR(150) NOT NULL DEFAULT 'Pelanggan Umum',
  \`subtotal\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`discount_amount\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`grand_total\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`total_cost\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`profit\` BIGINT NOT NULL DEFAULT 0,
  \`payment_method\` ENUM('TUNAI', 'TRANSFER', 'QRIS') NOT NULL DEFAULT 'TUNAI',
  \`amount_paid\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`change_amount\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`status\` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  \`notes\` VARCHAR(255) DEFAULT NULL,
  CONSTRAINT \`fk_sales_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE SET NULL,
  INDEX \`idx_sales_invoice\` (\`invoice_no\`),
  INDEX \`idx_sales_date\` (\`date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABEL DETAIL PENJUALAN (sale_items)
DROP TABLE IF EXISTS \`sale_items\`;
CREATE TABLE \`sale_items\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`sale_id\` INT UNSIGNED NOT NULL,
  \`item_type\` ENUM('product', 'service') NOT NULL DEFAULT 'product',
  \`item_id\` INT UNSIGNED NOT NULL,
  \`code\` VARCHAR(50) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`unit\` VARCHAR(20) NOT NULL,
  \`qty\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`buy_price\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`sell_price\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`subtotal\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`profit\` BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT \`fk_sale_items_sale\` FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TABEL PEMBELIAN KE SUPPLIER (purchases)
DROP TABLE IF EXISTS \`purchases\`;
CREATE TABLE \`purchases\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`purchase_no\` VARCHAR(50) NOT NULL UNIQUE,
  \`date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`supplier_id\` INT UNSIGNED NOT NULL,
  \`supplier_name\` VARCHAR(150) NOT NULL,
  \`total_amount\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  \`payment_status\` ENUM('LUNAS', 'HUTANG') NOT NULL DEFAULT 'LUNAS',
  \`notes\` VARCHAR(255) DEFAULT NULL,
  CONSTRAINT \`fk_purchases_supplier\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;`;

  const handleDownloadSQL = () => {
    const blob = new Blob([mysqlScript], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'database_mysql.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const requirementsTxt = `Flask==3.0.2
Flask-SQLAlchemy==3.1.1
Werkzeug==3.0.1
PyMySQL==1.1.0
cryptography==42.0.5
openpyxl==3.1.2
reportlab==4.1.0
python-dotenv==1.0.1`;

  const envFileExample = `# Konfigurasi Database MySQL SI TOKO
MYSQL_USER=root
MYSQL_PASSWORD=rahasia_anda
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=si_toko

# Atau URL lengkap SQLAlchemy PyMySQL:
DATABASE_URL=mysql+pymysql://root:rahasia_anda@localhost:3306/si_toko?charset=utf8mb4`;

  const windowsRunCommands = `# 1. Buka folder proyek di Visual Studio Code (Terminal PowerShell atau CMD)
cd python-store-management

# 2. Impor Database ke MySQL (XAMPP / Laragon / MySQL Server)
mysql -u root -p < database_mysql.sql

# 3. Buat Python Virtual Environment (venv)
python -m venv venv

# 4. Aktifkan Virtual Environment
# Di Windows PowerShell:
.\\venv\\Scripts\\Activate.ps1
# Atau di Command Prompt:
.\\venv\\Scripts\\activate.bat

# 5. Install seluruh dependensi yang dibutuhkan (termasuk PyMySQL)
pip install -r requirements.txt

# 6. Jalankan aplikasi SI TOKO
python app.py

# 7. Buka browser di http://localhost:5000`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Database MySQL &amp; Panduan Python Flask
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Skrip DDL SQL lengkap untuk MySQL, driver PyMySQL, koneksi database, dan panduan menjalankan di Windows VS Code.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'mysql'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Skrip SQL MySQL</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'python'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Koneksi Python &amp; .env</span>
          </button>
          <button
            onClick={() => setActiveTab('vscode')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'vscode'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Langkah VS Code</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MySQL SQL SCRIPT */}
      {activeTab === 'mysql' && (
        <div className="space-y-4">
          {/* Quick Action Card */}
          <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 p-5 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/30">
                  MySQL 8.0+ / MariaDB Ready (InnoDB utf8mb4)
                </span>
              </div>
              <h2 className="text-base font-bold">
                Skrip SQL Lengkap: database_mysql.sql
              </h2>
              <p className="text-xs text-blue-100 mt-0.5 max-w-xl">
                Membuat database <code>si_toko</code>, 13 tabel relasional dengan Foreign Key lengkap, indeks pencarian cepat, serta data seed part komputer &amp; percetakan.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleDownloadSQL}
                className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File .SQL</span>
              </button>
              <button
                onClick={() => copyToClipboard(mysqlScript, 'full_sql')}
                className="px-3.5 py-2 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-blue-400/30 transition-colors"
              >
                {copiedKey === 'full_sql' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Semua SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cara Import Cepat */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                1. Lewat CMD / Terminal
              </span>
              <p className="text-slate-500 mb-2">
                Jalankan perintah berikut di folder proyek:
              </p>
              <code className="block bg-slate-100 p-2 rounded text-[11px] font-mono text-slate-800">
                mysql -u root -p &lt; database_mysql.sql
              </code>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                2. Lewat phpMyAdmin (XAMPP)
              </span>
              <p className="text-slate-500">
                Buka <code>http://localhost/phpmyadmin</code>, klik menu <strong>Import</strong>, pilih file <code>database_mysql.sql</code>, lalu klik <strong>Go / Kirim</strong>.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">
                3. Lewat DBeaver / Workbench
              </span>
              <p className="text-slate-500">
                Buka koneksi MySQL, pilih menu <strong>File -&gt; Open SQL Script</strong>, lalu klik ikon petir (<strong>Execute All</strong>).
              </p>
            </div>
          </div>

          {/* SQL Code Box */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-slate-300 font-bold">
                  python-store-management/database_mysql.sql
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(mysqlScript, 'sql_box')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                {copiedKey === 'sql_box' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql_box' ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
              {mysqlScript}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: PYTHON & ENV CONNECTION */}
      {activeTab === 'python' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Konfigurasi Koneksi MySQL (.env)
                </h2>
              </div>
              <button
                onClick={() => copyToClipboard(envFileExample, 'env_file')}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold"
              >
                {copiedKey === 'env_file' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin .env</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
              {envFileExample}
            </pre>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  File requirements.txt (Termasuk PyMySQL &amp; Cryptography)
                </h2>
              </div>
              <button
                onClick={() => copyToClipboard(requirementsTxt, 'req_mysql')}
                className="flex items-center gap-1 text-xs text-blue-600 font-semibold"
              >
                {copiedKey === 'req_mysql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin requirements.txt</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
              {requirementsTxt}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: VS CODE STEP BY STEP */}
      {activeTab === 'vscode' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Langkah Lengkap Eksekusi di Windows Melalui VS Code
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
      )}
    </div>
  );
};
