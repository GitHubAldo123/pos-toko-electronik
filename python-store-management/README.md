# SI TOKO - Manajemen Part Komputer & Percetakan (MySQL & Flask)

Aplikasi manajemen operasional toko lengkap berbasis web untuk usaha yang bergerak di bidang penjualan part komputer, aksesoris komputer, dan jasa percetakan dengan database **MySQL (InnoDB / utf8mb4)**.

---

## 1. Setup Database MySQL

File skrip SQL lengkap siap import telah disediakan di:
`database_mysql.sql`

Skrip tersebut mencakup:
- Pembuatan database `si_toko` dengan charset `utf8mb4_unicode_ci`
- 13 tabel relasional (Engine `InnoDB`, Foreign Keys, Indexes, Auto-Increment)
- Data seed lengkap (20 produk nyata, 12 jasa cetak, supplier, pelanggan, pengaturan toko)
- View laporan `v_inventory_summary` & `v_daily_sales_summary`

### Cara Impor Skrip ke MySQL:

#### Opsi A: Melalui Command Line (CMD / PowerShell / Bash)
```bash
mysql -u root -p < database_mysql.sql
```
*(Ketik password MySQL Anda saat diminta, lalu tekan Enter)*

#### Opsi B: Melalui phpMyAdmin (XAMPP / Laragon)
1. Buka browser: `http://localhost/phpmyadmin`
2. Klik tab **Import** di bagian atas.
3. Klik tombol **Choose File** / Telusuri, lalu pilih file `database_mysql.sql`.
4. Klik tombol **Go** / Kirim di bagian bawah.
5. Database `si_toko` dan seluruh tabel berhasil dibuat!

#### Opsi C: Melalui MySQL Workbench / DBeaver
1. Buka MySQL Workbench atau DBeaver, hubungkan ke koneksi MySQL lokal.
2. Buka menu **File** -> **Open SQL Script**, pilih file `database_mysql.sql`.
3. Klik icon petir (**Execute Script**).

---

## 2. Konfigurasi Koneksi Python ke MySQL

Buat file `.env` di dalam folder ini (atau sesuaikan di `config.py`):

```ini
MYSQL_USER=root
MYSQL_PASSWORD=rahasia_anda
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DB=si_toko

# Atau langsung gunakan format URL:
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/si_toko?charset=utf8mb4
```

---

## 3. Langkah Menjalankan di Windows (VS Code)

Buka terminal di VS Code (`Ctrl + \``):

```powershell
# 1. Masuk ke direktori
cd python-store-management

# 2. Buat virtual environment
python -m venv venv

# 3. Aktifkan virtual environment
.\venv\Scripts\Activate.ps1

# 4. Install dependensi (termasuk PyMySQL & Flask)
pip install -r requirements.txt

# 5. Jalankan aplikasi Flask
python app.py
```

Aplikasi Flask akan berjalan di:
`http://localhost:5000`
