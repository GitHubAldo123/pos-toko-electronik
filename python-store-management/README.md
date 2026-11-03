# SI TOKO - Manajemen Part Komputer & Percetakan

Aplikasi manajemen operasional toko lengkap berbasis web untuk usaha yang bergerak di bidang penjualan part komputer, aksesoris komputer, dan jasa percetakan.

---

## Fitur Utama

1. **Dashboard Statistik Real-Time**:
   - Total produk & total stok fisik
   - Nilai persediaan persediaan (HPP modal)
   - Omset penjualan & laba kotor hari ini
   - Grafik analitik harian, mingguan, dan bulanan
   - Notifikasi stok menipis dan barang habis
   - Daftar 5 produk terlaris

2. **Katalog Produk & Kategori**:
   - CRUD Produk lengkap (SKU, barcode, merek, spesifikasi, satuan, lokasi rak)
   - Filter divisi Part Komputer & Perlengkapan Percetakan
   - Kalkulator margin laba otomatis (`(Jual - Modal) / Jual * 100%`)

3. **Manajemen Harga & Margin**:
   - Ubah harga modal & harga jual per unit
   - Ubah harga massal (Batch Price Update berdasarkan % atau nominal)
   - Audit trail riwayat perubahan harga

4. **Manajemen Stok & Mutasi**:
   - Stok Masuk (IN) & Stok Keluar (OUT)
   - Stok Opname fisik vs sistem (perhitungan selisih otomatis)
   - Log mutasi stok lengkap dengan waktu, user, dan alasan perubahan

5. **Kasir POS & Transaksi Penjualan**:
   - Pencarian cepat nama / kode / barcode
   - Keranjang belanja kasir
   - Potongan diskon (nominal atau persentase)
   - Metode bayar: Tunai (tombol uang pas & preset), Transfer Bank, QRIS
   - Pengurangan stok otomatis konsisten & pencatatan snapshot modal transaksi

6. **Jasa Percetakan**:
   - Layanan Print B/W, Warna, Fotokopi, Jilid, Laminasi, Cetak Foto, Banner
   - Kalkulator cepat biaya cetak dan finishing
   - Konfigurasi pemakaian bahan stok

7. **Pembelian (PO Supplier)**:
   - Pencatatan pembelian dari supplier
   - Otomatis tambah stok & mutasi masuk tanpa merubah harga jual

8. **Laporan & Ekspor**:
   - Laporan Penjualan, Laba Rugi Komprehensif, Nilai Stok, Barang Terlaris, Pembelian
   - Filter periode: Hari ini, Kemarin, 7 hari, Bulan ini, Tahun ini, Custom range
   - Ekspor ke Excel / CSV (UTF-8 BOM)
   - Cetak Laporan (Print-ready formal format)

9. **Cetak Struk Thermal**:
   - Format printer thermal 58 mm dan 80 mm

---

## Panduan Instalasi di Windows (VS Code)

### 1. Prasyarat
- Komputer Windows 10 atau 11
- Python 3.10+ terinstal (pastikan centang "Add Python to PATH" saat instalasi)
- Visual Studio Code

### 2. Langkah Menjalankan
Buka Terminal di VS Code (`Ctrl + \``):

```powershell
# 1. Masuk ke direktori proyek
cd python-store-management

# 2. Buat virtual environment
python -m venv venv

# 3. Aktifkan virtual environment
.\venv\Scripts\Activate.ps1
# Jika muncul error execution policy di PowerShell, jalankan dulu:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 4. Install dependensi
pip install -r requirements.txt

# 5. Jalankan server Flask
python app.py
```

Buka browser di:
`http://localhost:5000`
