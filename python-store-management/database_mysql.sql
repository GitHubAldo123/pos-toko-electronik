-- =====================================================================
-- SI TOKO - SISTEM INFORMASI MANAJEMEN PART KOMPUTER & PERCETAKAN
-- DATABASE SCHEMA & SEED DATA UNTUK MYSQL (InnoDB, utf8mb4)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `si_toko` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `si_toko`;

-- Matikan foreign key check saat migrasi/setup awal
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. TABEL PENGATURAN TOKO (settings)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `store_name` VARCHAR(150) NOT NULL DEFAULT 'SI TOKO COMPUTER & PERCETAKAN',
  `tagline` VARCHAR(255) DEFAULT 'Solusi Lengkap Hardware Komputer, Aksesoris & Digital Printing',
  `address` TEXT NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `receipt_footer` TEXT DEFAULT NULL,
  `receipt_paper_size` ENUM('58mm', '80mm') DEFAULT '58mm',
  `invoice_prefix` VARCHAR(10) DEFAULT 'TRX',
  `default_min_stock` INT UNSIGNED DEFAULT 3,
  `currency_symbol` VARCHAR(10) DEFAULT 'Rp',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. TABEL PENGGUNA / KASIR / ADMIN (users)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'kasir', 'operator') NOT NULL DEFAULT 'kasir',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. TABEL KATEGORI BARANG & JASA (categories)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('computer', 'printing_supply', 'service') NOT NULL DEFAULT 'computer',
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category_type` (`type`),
  INDEX `idx_category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. TABEL SUPPLIER / PEMASOK (suppliers)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `address` TEXT NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_purchases` BIGINT UNSIGNED DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_supplier_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. TABEL PELANGGAN (customers)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `total_orders` INT UNSIGNED DEFAULT 0,
  `total_spent` BIGINT UNSIGNED DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_name` (`name`),
  INDEX `idx_customer_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. TABEL PRODUK BARANG (products)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `barcode` VARCHAR(50) DEFAULT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `spec` TEXT DEFAULT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'pcs',
  `buy_price` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Harga modal dalam Rupiah',
  `sell_price` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Harga jual dalam Rupiah',
  `stock` INT NOT NULL DEFAULT 0,
  `min_stock` INT UNSIGNED NOT NULL DEFAULT 3,
  `location` VARCHAR(100) DEFAULT NULL COMMENT 'Lokasi rak penyimpanan',
  `supplier_id` INT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  INDEX `idx_prod_code` (`code`),
  INDEX `idx_prod_barcode` (`barcode`),
  INDEX `idx_prod_name` (`name`),
  INDEX `idx_prod_stock` (`stock`),
  INDEX `idx_prod_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. TABEL JASA PERCETAKAN (services)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `unit` VARCHAR(20) NOT NULL DEFAULT 'lembar',
  `cost_price` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `sell_price` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `notes` VARCHAR(255) DEFAULT NULL,
  `linked_supply_product_id` INT UNSIGNED DEFAULT NULL COMMENT 'ID bahan kertas/tinta yang dipakai',
  `supply_usage_per_unit` DECIMAL(10,2) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_services_supply_prod` FOREIGN KEY (`linked_supply_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  INDEX `idx_service_code` (`code`),
  INDEX `idx_service_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. TABEL RIWAYAT PERUBAHAN HARGA (price_histories)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `price_histories`;
CREATE TABLE `price_histories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `product_code` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `old_buy_price` BIGINT UNSIGNED NOT NULL,
  `new_buy_price` BIGINT UNSIGNED NOT NULL,
  `old_sell_price` BIGINT UNSIGNED NOT NULL,
  `new_sell_price` BIGINT UNSIGNED NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_price_hist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  INDEX `idx_price_hist_prod` (`product_id`),
  INDEX `idx_price_hist_time` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. TABEL MUTASI STOK / LOG INVENTORY (stock_movements)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `movement_type` ENUM('IN', 'OUT', 'ADJUST', 'SALE', 'PURCHASE', 'RETURN') NOT NULL,
  `quantity` INT NOT NULL COMMENT 'Positif untuk penambahan, negatif untuk pengurangan',
  `before_stock` INT NOT NULL,
  `after_stock` INT NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `reference_no` VARCHAR(50) DEFAULT NULL COMMENT 'No Invoice Penjualan atau No PO Pembelian',
  `user` VARCHAR(50) DEFAULT 'Admin',
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_stock_mov_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  INDEX `idx_mov_product` (`product_id`),
  INDEX `idx_mov_type` (`movement_type`),
  INDEX `idx_mov_ref` (`reference_no`),
  INDEX `idx_mov_time` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. TABEL TRANSAKSI PENJUALAN KASIR (sales)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `invoice_no` VARCHAR(50) NOT NULL UNIQUE,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `customer_id` INT UNSIGNED DEFAULT NULL,
  `customer_name` VARCHAR(150) NOT NULL DEFAULT 'Pelanggan Umum',
  `subtotal` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `discount_type` ENUM('nominal', 'percent') DEFAULT 'nominal',
  `discount_value` INT UNSIGNED DEFAULT 0,
  `discount_amount` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `grand_total` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `total_cost` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total HPP modal saat transaksi',
  `profit` BIGINT NOT NULL DEFAULT 0 COMMENT 'grand_total - total_cost',
  `payment_method` ENUM('TUNAI', 'TRANSFER', 'QRIS') NOT NULL DEFAULT 'TUNAI',
  `amount_paid` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `change_amount` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'COMPLETED',
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_by` VARCHAR(50) DEFAULT 'Kasir',
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  INDEX `idx_sales_invoice` (`invoice_no`),
  INDEX `idx_sales_date` (`date`),
  INDEX `idx_sales_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. TABEL ITEM DETAIL PENJUALAN (sale_items)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sale_id` INT UNSIGNED NOT NULL,
  `item_type` ENUM('product', 'service') NOT NULL DEFAULT 'product',
  `item_id` INT UNSIGNED NOT NULL COMMENT 'ID Product atau ID Service',
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `buy_price` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Snapshot harga beli modal',
  `sell_price` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Snapshot harga jual saat transaksi',
  `subtotal` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `profit` BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  INDEX `idx_item_sale` (`sale_id`),
  INDEX `idx_item_prod_service` (`item_type`, `item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. TABEL PEMBELIAN KE SUPPLIER (purchases)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `purchase_no` VARCHAR(50) NOT NULL UNIQUE,
  `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `supplier_id` INT UNSIGNED NOT NULL,
  `supplier_name` VARCHAR(150) NOT NULL,
  `total_amount` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `payment_status` ENUM('LUNAS', 'HUTANG') NOT NULL DEFAULT 'LUNAS',
  `due_date` DATE DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT,
  INDEX `idx_po_number` (`purchase_no`),
  INDEX `idx_po_date` (`date`),
  INDEX `idx_po_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. TABEL ITEM DETAIL PEMBELIAN (purchase_items)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE `purchase_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `purchase_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `buy_price` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `subtotal` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT `fk_purchase_items_po` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_purchase_items_prod` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
  INDEX `idx_po_item_po` (`purchase_id`),
  INDEX `idx_po_item_prod` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nyalakan kembali foreign key check
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- DATA SEED AWAL (SAMPLE DATA NYATA)
-- =====================================================================

-- Setting awal toko
INSERT INTO `settings` (`id`, `store_name`, `tagline`, `address`, `phone`, `email`, `receipt_footer`, `receipt_paper_size`, `invoice_prefix`, `default_min_stock`)
VALUES (
  1,
  'SI TOKO COMPUTER & PERCETAKAN',
  'Solusi Lengkap Hardware Komputer, Aksesoris & Digital Printing',
  'Jl. Merdeka Raya No. 45, Kompleks Ruko Niaga Blok B-3',
  '0812-3456-7890',
  'info@sitoko-komputer.com',
  'Terima kasih atas kunjungan dan kepercayaan Anda!\nBarang yang sudah dibeli dapat ditukar dalam 3 hari dengan struk.',
  '58mm',
  'TRX',
  3
);

-- Pengguna sistem default (password default: 'admin123')
INSERT INTO `users` (`id`, `username`, `password_hash`, `full_name`, `role`)
VALUES
  (1, 'admin', 'pbkdf2:sha256:600000$admin$2e6a9f4d7b...', 'Admin Utama Toko', 'admin'),
  (2, 'kasir1', 'pbkdf2:sha256:600000$kasir$9b7a4c8e1d...', 'Kasir Shift Pagi', 'kasir');

-- Kategori
INSERT INTO `categories` (`id`, `code`, `name`, `type`, `description`)
VALUES
  (1, 'CAT-CPU', 'Processor', 'computer', 'CPU Intel & AMD'),
  (2, 'CAT-MBO', 'Motherboard', 'computer', 'Motherboard Intel & AMD'),
  (3, 'CAT-RAM', 'RAM (Memory)', 'computer', 'DDR4 & DDR5 RAM'),
  (4, 'CAT-SSD', 'SSD & Storage', 'computer', 'SSD NVMe, SATA & HDD'),
  (5, 'CAT-VGA', 'VGA / Kartu Grafis', 'computer', 'GPU Nvidia & AMD Radeon'),
  (6, 'CAT-PSU', 'Power Supply', 'computer', 'PSU Bronze & Gold 500W-850W'),
  (7, 'CAT-MON', 'Monitor', 'computer', 'Monitor LED IPS 100Hz'),
  (8, 'CAT-PERI', 'Keyboard & Mouse', 'computer', 'Periferal kantor & gaming'),
  (9, 'CAT-CBL', 'Kabel & Adaptor', 'computer', 'HDMI, VGA, LAN, Power'),
  (10, 'CAT-ACC', 'Aksesoris Komputer', 'computer', 'Flashdisk, Pasta, USB Hub'),
  (11, 'CAT-PPR', 'Kertas HVS & Foto', 'printing_supply', 'Kertas A4, F4, Photo Paper'),
  (12, 'CAT-INK', 'Tinta & Toner', 'printing_supply', 'Tinta botol Epson/Canon, Toner HP'),
  (13, 'CAT-LAM', 'Plastik Laminasi', 'printing_supply', 'Plastik laminasi panas'),
  (14, 'CAT-BND', 'Bahan Jilid', 'printing_supply', 'Mika, Lakban jilid, kawat spiral'),
  (15, 'CAT-SRV1', 'Print & Dokumen', 'service', 'Print B/W, Warna & Cetak Dokumen'),
  (16, 'CAT-SRV2', 'Cetak Foto', 'service', 'Cetak foto ukuran pas, 4R, 10R'),
  (17, 'CAT-SRV3', 'Finishing & Jilid', 'service', 'Laminasi, Jilid Lakban, Spiral'),
  (18, 'CAT-SRV4', 'Banner & Spanduk', 'service', 'Digital printing format besar'),
  (19, 'CAT-SRV5', 'Desain Grafis', 'service', 'Jasa setting layout & desain');

-- Supplier
INSERT INTO `suppliers` (`id`, `name`, `phone`, `email`, `address`, `notes`, `total_purchases`)
VALUES
  (1, 'PT Nusantara Komputer Distribusi', '021-5551234', 'sales@nusantarakomp.co.id', 'Mangga Dua Mall Lt. 3 No. 42, Jakarta Pusat', 'Distributor utama Intel, Asus, Samsung', 45000000),
  (2, 'CV Media Grafika Paperindo', '031-8976543', 'order@mediagrafika.com', 'Kawasan Industri Rungkut Blok D-11, Surabaya', 'Suplier resmi PaperOne & SiDU', 18500000),
  (3, 'PT Mitra Toner & Ink Nusantara', '022-7213456', 'info@mitratoner.com', 'Jl. Soekarno Hatta No. 210, Bandung', 'Distributor Tinta Epson & Toner HP', 22000000);

-- Pelanggan
INSERT INTO `customers` (`id`, `name`, `phone`, `address`, `notes`, `total_orders`, `total_spent`)
VALUES
  (1, 'Budi Santoso (Warnet Cyber)', '0813-8899-7766', 'Jl. Ahmad Yani No. 12', 'Pelanggan rutin aksesoris dan periferal PC', 6, 4250000),
  (2, 'Klinik Medika Utama (dr. Hendra)', '0852-1122-3344', 'Jl. Diponegoro No. 88', 'Rutin fotokopi berkas & resep', 14, 1850000),
  (3, 'SMKN 1 Bagian Tata Usaha', '0812-4455-6677', 'Jl. Pendidikan No. 1', 'Order jilid modul dan perlengkapan ujian', 9, 3400000);

-- Produk Part Komputer & Perlengkapan Percetakan
INSERT INTO `products` (`id`, `code`, `barcode`, `name`, `category_id`, `brand`, `spec`, `unit`, `buy_price`, `sell_price`, `stock`, `min_stock`, `location`, `supplier_id`)
VALUES
  (1, 'CPU-I5-12400F', '8991001001', 'Intel Core i5-12400F 6-Core 12-Thread Box', 1, 'Intel', 'LGA1700, 2.5GHz up to 4.4GHz, 18MB Cache', 'pcs', 1750000, 2050000, 8, 3, 'Etalase A1 - Rak CPU', 1),
  (2, 'CPU-RYZ-5600', '8991001002', 'AMD Ryzen 5 5600 6-Core 12-Thread AM4', 1, 'AMD', 'AM4, 3.5GHz up to 4.4GHz, 35MB Cache', 'pcs', 1550000, 1850000, 5, 2, 'Etalase A1 - Rak CPU', 1),
  (3, 'MBO-ASUS-B760M', '8991001003', 'Asus Prime B760M-A WiFi D4 Motherboard', 2, 'Asus', 'LGA1700, Dual M.2 PCIe 4.0, 4x DDR4, WiFi 6', 'pcs', 1950000, 2280000, 4, 2, 'Rak B2 - Motherboard', 1),
  (4, 'RAM-KF-16GB3200', '8991001004', 'Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz', 3, 'Kingston', 'Kit 16GB, CL16 Black Heatspreader', 'pcs', 520000, 650000, 12, 4, 'Etalase A2 - Rak RAM', 1),
  (5, 'SSD-SAM-980-500', '8991001005', 'SSD Samsung 980 500GB NVMe M.2 PCIe 3.0', 4, 'Samsung', 'M.2 2280 NVMe, Read 3100MB/s', 'pcs', 640000, 790000, 2, 4, 'Etalase A2 - Rak SSD', 1),
  (6, 'VGA-RTX4060-8G', '8991001006', 'Zotac Gaming GeForce RTX 4060 8GB Twin Edge', 5, 'Zotac', '8GB GDDR6 128-bit, DLSS 3, Dual Fan', 'pcs', 4700000, 5250000, 3, 2, 'Etalase Utama - Rak VGA', 1),
  (7, 'PSU-DP-PK550D', '8991001007', 'DeepCool PK550D 550W 80 Plus Bronze', 6, 'DeepCool', '550W, 80+ Bronze, Flat Black Cables', 'unit', 560000, 685000, 6, 2, 'Rak C1 - PSU', 1),
  (8, 'MON-LG-24IPS', '8991001008', 'Monitor LG 24MR400-B 24 Inch IPS 100Hz FHD', 7, 'LG', '23.8" FHD IPS Panel, 100Hz, AMD FreeSync', 'unit', 1100000, 1320000, 4, 2, 'Rak Display Monitor', 1),
  (9, 'KBM-LOG-MK120', '8991001009', 'Logitech MK120 Combo Keyboard & Mouse USB', 8, 'Logitech', 'Spill-resistant, 1000 DPI mouse', 'set', 145000, 185000, 18, 5, 'Rak D1 - Periferal', 1),
  (10, 'MOU-LOG-G102', '8991001010', 'Logitech G102 Lightsync RGB Gaming Mouse', 8, 'Logitech', '8000 DPI, 6 Buttons, LIGHTSYNC RGB', 'pcs', 220000, 285000, 9, 3, 'Rak D1 - Periferal', 1),
  (11, 'KBL-HDMI-20-15M', '8991001011', 'Kabel HDMI 2.0 4K 60Hz Nylon Braided 1.5M', 9, 'Vention', 'HDMI Male to Male, 4K@60Hz HDR Gold Plated', 'pcs', 35000, 65000, 25, 8, 'Gantungan Rak Aksesoris', 1),
  (12, 'FD-SANDISK-64G', '8991001012', 'Flashdisk SanDisk Ultra Flair 64GB USB 3.0', 10, 'SanDisk', 'USB 3.0 up to 150MB/s, Metal Casing', 'pcs', 65000, 95000, 14, 5, 'Etalase Kasir Depan', 1),
  (13, 'THM-ARCTIC-MX4', '8991001013', 'Thermal Paste Arctic MX-4 4 Gram Original', 10, 'Arctic', 'Compound 8.5 W/(mK), Non-Conductive', 'pcs', 75000, 115000, 0, 3, 'Etalase Servis', 1),
  (14, 'PPR-A4-75G-P1', '8992002001', 'Kertas HVS PaperOne A4 75 Gram (Rim)', 11, 'PaperOne', 'A4 210 x 297 mm, 75 gsm, 500 Lembar', 'rim', 48000, 58000, 45, 10, 'Gudang Belakang - Palet', 2),
  (15, 'PPR-F4-70G-SD', '8992002002', 'Kertas HVS Sinar Dunia F4 70 Gram (Rim)', 11, 'SiDU', 'F4 215 x 330 mm, 70 gsm, 500 Lembar', 'rim', 49000, 60000, 38, 10, 'Gudang Belakang - Palet', 2),
  (16, 'PPR-FOTO-A4-GLOS', '8992002003', 'Kertas Foto Glossy A4 230 Gsm (Isi 20 Lembar)', 11, 'Spectra', 'Cast Coated Glossy 5760 dpi, 20 Lembar', 'pak', 22000, 32000, 16, 5, 'Rak Bahan Cetak 1', 2),
  (17, 'INK-EPS-003-BK', '8992002004', 'Tinta Botol Epson 003 Black 65ml Original', 12, 'Epson', 'T00V1 Original, L3110/L3210', 'botol', 72000, 90000, 20, 6, 'Rak Tinta Etalase', 3),
  (18, 'TNR-HP-85A-COMP', '8992002005', 'Toner Cartridge HP 85A CE285A Compatible', 12, 'Premium', 'LaserJet P1102, ~1600 Halaman', 'box', 110000, 155000, 1, 3, 'Rak Toner Belakang', 3),
  (19, 'LAM-A4-100MIC', '8992002006', 'Plastik Laminating Panas A4 100 Micron (Isi 100)', 13, 'Joyko', 'Pouch film 220x307mm 100 mic', 'pak', 55000, 75000, 11, 4, 'Rak Bahan Finishing', 2),
  (20, 'JLD-LKB-36MM', '8992002007', 'Lakban Jilid Hitam Cloth Tape 36mm x 12m', 14, 'Nachi', 'Kain tebal lem kuat jilid skripsi', 'roll', 16000, 24000, 22, 6, 'Meja Finishing', 2);

-- Jasa Percetakan
INSERT INTO `services` (`id`, `code`, `name`, `category_id`, `unit`, `cost_price`, `sell_price`, `is_active`, `notes`, `linked_supply_product_id`, `supply_usage_per_unit`)
VALUES
  (1, 'JSA-PRN-BW', 'Print HVS A4 Hitam Putih (Teks Dokumen)', 15, 'lembar', 80, 500, TRUE, 'Kertas HVS 75gsm standar tugas', 14, 1.00),
  (2, 'JSA-PRN-CLR', 'Print HVS A4 Warna Teks & Grafik', 15, 'lembar', 200, 1500, TRUE, 'Warna teks grafik medium', 14, 1.00),
  (3, 'JSA-PRN-FULL', 'Print HVS A4 Full Color / Gambar Penuh', 15, 'lembar', 400, 2500, TRUE, 'Poster / gambar resolusi tinggi', 14, 1.00),
  (4, 'JSA-FCP-A4', 'Fotokopi HVS A4 / F4 (1 Muka)', 15, 'lembar', 70, 350, TRUE, 'Mesin fotokopi laser high speed', 14, 1.00),
  (5, 'JSA-FCP-DUP', 'Fotokopi HVS A4 / F4 Bolak-Balik (2 Muka)', 15, 'lembar', 100, 500, TRUE, 'Hemat kertas untuk modul', 14, 1.00),
  (6, 'JSA-FTO-4R', 'Cetak Foto 4R Kertas Glossy Premium', 16, 'lembar', 800, 3000, TRUE, '10 x 15 cm warna tajam tahan pudar', 16, 1.00),
  (7, 'JSA-FTO-10R', 'Cetak Foto 10R / A4 Glossy', 16, 'lembar', 2500, 12000, TRUE, '20 x 25 cm', 16, 1.00),
  (8, 'JSA-LAM-A4', 'Laminasi Panas A4 / F4', 17, 'lembar', 900, 4000, TRUE, 'Plastik tebal 100 mic anti air', 19, 1.00),
  (9, 'JSA-JLD-LKB', 'Jilid Lakban Biasa + Mika Bening', 17, 'buku', 1200, 5000, TRUE, 'Jilid makalah, laporan, skripsi draft', NULL, NULL),
  (10, 'JSA-JLD-SPR', 'Jilid Spiral Kawat + Cover Mika Depan Belakang', 17, 'buku', 3500, 12000, TRUE, 'Rapi dan elegan untuk kalender & buku', NULL, NULL),
  (11, 'JSA-BNR-FLX', 'Cetak Banner / Spanduk Flexi 280g', 18, 'meter', 13000, 25000, TRUE, 'Hitungan per meter persegi PxL', NULL, NULL),
  (12, 'JSA-DSG-SM', 'Jasa Desain Ringan / Setting Format Dokumen', 19, 'unit', 0, 20000, TRUE, 'Ketikan ulang sederhana, kop surat', NULL, NULL);

-- Riwayat Perubahan Harga Contoh
INSERT INTO `price_histories` (`id`, `product_id`, `product_code`, `product_name`, `old_buy_price`, `new_buy_price`, `old_sell_price`, `new_sell_price`, `reason`, `timestamp`)
VALUES
  (1, 1, 'CPU-I5-12400F', 'Intel Core i5-12400F 6-Core 12-Thread Box', 1800000, 1750000, 2100000, 2050000, 'Penyesuaian penurunan kurs dollar distributor', '2026-02-10 14:30:00'),
  (2, 14, 'PPR-A4-75G-P1', 'Kertas HVS PaperOne A4 75 Gram (Rim)', 46000, 48000, 55000, 58000, 'Kenaikan harga pabrik kertas pulp nasional', '2026-02-24 10:00:00');

-- Transaksi Penjualan Contoh
INSERT INTO `sales` (`id`, `invoice_no`, `date`, `customer_id`, `customer_name`, `subtotal`, `discount_amount`, `grand_total`, `total_cost`, `profit`, `payment_method`, `amount_paid`, `change_amount`, `status`, `notes`)
VALUES
  (1, 'TRX-20260301-001', '2026-03-01 10:15:00', 1, 'Budi Santoso (Warnet Cyber)', 1585000, 35000, 1550000, 1260000, 290000, 'TRANSFER', 1550000, 0, 'COMPLETED', 'Pembayaran via BCA Mobile'),
  (2, 'TRX-20260301-002', '2026-03-01 13:40:00', NULL, 'Pelanggan Umum', 27500, 0, 27500, 4800, 22700, 'TUNAI', 50000, 22500, 'COMPLETED', 'Print tugas kuliah'),
  (3, 'TRX-20260302-001', '2026-03-02 11:20:00', 3, 'SMKN 1 Bagian Tata Usaha', 470000, 20000, 450000, 384000, 66000, 'QRIS', 450000, 0, 'COMPLETED', 'Scan QRIS Dinamis');

-- Item Penjualan
INSERT INTO `sale_items` (`id`, `sale_id`, `item_type`, `item_id`, `code`, `name`, `unit`, `qty`, `buy_price`, `sell_price`, `subtotal`, `profit`)
VALUES
  (1, 1, 'product', 4, 'RAM-KF-16GB3200', 'Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz', 'pcs', 2, 520000, 650000, 1300000, 260000),
  (2, 1, 'product', 10, 'MOU-LOG-G102', 'Logitech G102 Lightsync RGB Gaming Mouse', 'pcs', 1, 220000, 285000, 285000, 65000),
  (3, 2, 'service', 1, 'JSA-PRN-BW', 'Print HVS A4 Hitam Putih (Teks Dokumen)', 'lembar', 45, 80, 500, 22500, 18900),
  (4, 2, 'service', 9, 'JSA-JLD-LKB', 'Jilid Lakban Biasa + Mika Bening Depan Belakang', 'buku', 1, 1200, 5000, 5000, 3800),
  (5, 3, 'product', 14, 'PPR-A4-75G-P1', 'Kertas HVS PaperOne A4 75 Gram (Rim)', 'rim', 5, 48000, 58000, 290000, 50000),
  (6, 3, 'product', 17, 'INK-EPS-003-BK', 'Tinta Botol Epson 003 Black 65ml Original', 'botol', 2, 72000, 90000, 180000, 36000);

-- Mutasi Stok
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `before_stock`, `after_stock`, `reason`, `reference_no`, `user`, `timestamp`)
VALUES
  (1, 1, 'PURCHASE', 5, 3, 8, 'Pembelian dari PT Nusantara Komputer (PO-20260220-001)', 'PO-20260220-001', 'Admin Toko', '2026-02-20 09:30:00'),
  (2, 4, 'PURCHASE', 10, 4, 14, 'Pembelian dari PT Nusantara Komputer (PO-20260220-001)', 'PO-20260220-001', 'Admin Toko', '2026-02-20 09:30:00'),
  (3, 4, 'SALE', -2, 14, 12, 'Penjualan ke Budi Santoso (TRX-20260301-001)', 'TRX-20260301-001', 'Kasir 1', '2026-03-01 10:15:00'),
  (4, 10, 'SALE', -1, 10, 9, 'Penjualan ke Budi Santoso (TRX-20260301-001)', 'TRX-20260301-001', 'Kasir 1', '2026-03-01 10:15:00'),
  (5, 14, 'SALE', -5, 50, 45, 'Penjualan ke SMKN 1 (TRX-20260302-001)', 'TRX-20260302-001', 'Kasir 1', '2026-03-02 11:20:00');

-- ---------------------------------------------------------------------
-- VIEW UNTUK MEMPERMUDAH QUERY LAPORAN DI MYSQL
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW `v_inventory_summary` AS
SELECT 
  p.id,
  p.code,
  p.name,
  c.name AS category_name,
  p.stock,
  p.unit,
  p.buy_price,
  p.sell_price,
  (p.stock * p.buy_price) AS total_inventory_value,
  ROUND(((p.sell_price - p.buy_price) / p.sell_price) * 100, 2) AS margin_percent,
  CASE 
    WHEN p.stock <= 0 THEN 'HABIS'
    WHEN p.stock <= p.min_stock THEN 'MENIPIS'
    ELSE 'AMAN'
  END AS stock_status
FROM `products` p
LEFT JOIN `categories` c ON p.category_id = c.id;

CREATE OR REPLACE VIEW `v_daily_sales_summary` AS
SELECT 
  DATE(s.date) AS sale_date,
  COUNT(s.id) AS total_transactions,
  SUM(s.grand_total) AS total_revenue,
  SUM(s.total_cost) AS total_cogs,
  SUM(s.profit) AS total_gross_profit
FROM `sales` s
WHERE s.status = 'COMPLETED'
GROUP BY DATE(s.date)
ORDER BY sale_date DESC;
