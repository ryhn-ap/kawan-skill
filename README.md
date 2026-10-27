# 🤝 Kawan Skill — Marketplace Jasa & Pertukaran Keahlian Antar-Mahasiswa

<p align="center">
  <img src="assets/logo.svg" alt="Logo Kawan Skill" width="120" />
</p>

<p align="center">
  <b>Platform marketplace berbasis web yang menghubungkan mahasiswa untuk saling mempekerjakan keahlian (Minta Tolong) atau saling bertukar pengetahuan secara cuma-cuma (Tukar Skill).</b>
</p>

<p align="center">
  
  [![Netlify Status](https://api.netlify.com/api/v1/badges/fb7a2d3d-0772-4c84-a8a1-20b20ad8326f/deploy-status)](https://app.netlify.com/projects/kawanskill/deploys)
  <img src="https://img.shields.io/badge/Status-MVP%20Ready-2DB7AD?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Stack-Vanilla%20HTML%2FCSS%2FJS-FF8F2E?style=for-the-badge" alt="Stack" />
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Hosting-Netlify-00C7B7?style=for-the-badge&logo=netlify" alt="Netlify" />
</p>

---

## 📌 Tentang Proyek

**Kawan Skill** adalah inisiatif startup digital mahasiswa yang dibangun sebagai proyek luaran mata kuliah **Technopreneurship** dengan mengacu pada kurikulum kewirausahaan praktis (platform *Wadhwani Foundation*). 

Banyak mahasiswa memiliki talenta praktis (seperti desain grafis, pembuatan website, penulisan esai, atau video editing), namun mereka kesulitan menemukan audiens yang tepat di lingkungan kampusnya sendiri. Di sisi lain, mahasiswa lain kerap membutuhkan bantuan teknis cepat dengan tarif ramah kantong atau mencari rekan belajar untuk *peer-to-peer learning*. Kawan Skill hadir menjembatani kebutuhan tersebut melalui platform direktori keahlian yang ringan, transparan, dan minim hambatan (*low friction*).

Proyek ini dikembangkan oleh tim beranggotakan 3 orang:
* **2 Pengembang Teknis**: Bertanggung jawab atas perancangan antarmuka, arsitektur modular JavaScript, skema database, dan integrasi layanan Supabase.
* **1 Marketing & Quality Assurance**: Bertanggung jawab atas riset kebutuhan mahasiswa, pengumpulan data portofolio pengguna awal, pengujian fungsionalitas, serta demonstrasi produk.

---

## 🚀 Fitur Unggulan

### 1. 💼 Minta Tolong (Layanan Jasa Berbayar)
* **Akses Bebas Tanpa Wajib Login**: Pengunjung publik dapat langsung mencari mahasiswa berbakat dan menyewa jasanya tanpa hambatan pendaftaran akun.
* **Transparansi Tarif**: Setiap mahasiswa menentukan tarif dasar per jenis layanan yang mereka tawarkan (contoh: *Mulai Rp 50.000*).
* **Direct WhatsApp Checkout**: Formulir rincian pekerjaan otomatis mengompilasi draf pesan siap kirim langsung ke WhatsApp penyedia skill.

### 2. 🔄 Tukar Skill (Kolaborasi & Barter Pengetahuan Gratis)
* **Pemberdayaan Mahasiswa**: Mahasiswa dapat saling mengajarkan skill tanpa biaya (contoh: belajar Figma ditukar dengan bimbingan pemrograman Python).
* **Keamanan Akun Terdaftar**: Fitur ini mewajibkan pengguna untuk masuk (*login*) dan memiliki profil aktif agar pertukaran keahlian berlangsung adil dan jelas.

### 3. 🎯 Status Ketersediaan Dinamis (*Availability Badge*)
Penyedia skill dapat mengatur status ketersediaan mereka secara *real-time*:
* 🟢 **Sedang Free** (Satu-satunya status yang dapat menerima order Minta Tolong dan tawaran Tukar Skill).
* 🟡 **Sedang Menerima Pekerjaan**
* 🔵 **Sedang Bertukar Skill**
* ⚪ **Tidak Aktif**
* 🌴 **Liburan**

### 4. 🔒 Integrasi WhatsApp & Perlindungan Privasi
* Nomor ponsel penyedia keahlian **tidak pernah dipajang secara terbuka** di antarmuka publik guna mencegah spam, scraping nomor, dan pesan yang tidak relevan.
* Tombol kontak mengarahkan pemohon langsung ke aplikasi WhatsApp dengan pesan terformat rapi sesuai isian formulir.
* Website secara transparan menegaskan bahwa transaksi pembayaran dilakukan secara aman di luar platform (*no internal escrow/payment gateway*).

### 5. ⭐ Sistem Ulasan Berbasis Token (*Anti-Spam Review*)
* Form ulasan publik dilindungi oleh token tautan khusus (*invite-only review link*) yang dibuat oleh penyedia jasa setelah pekerjaan tuntas.
* Tampilan ulasan membedakan lencana verifikasi antara **Pengguna Terdaftar** dan **Pengguna Eksternal**.

---

## 🎨 Kategori Keahlian Awal

Platform Kawan Skill difokuskan pada 5 kategori keterampilan yang paling sering dibutuhkan di ekosistem kampus:
1. 🎨 **Desain Grafis**: Logo, poster acara, feeds media sosial, infografis.
2. 💻 **Web & Aplikasi**: Pembuatan landing page, perbaikan skrip web, integrasi form.
3. ⚙️ **Bahasa Pemrograman**: Bimbingan Python, C++, Java, pengolahan algoritma dasar.
4. 🎬 **Editing**: Video TikTok/Reels, podcast audio, pemotongan video presentasi.
5. ✍️ **Penulisan**: Proofreading laporan, perapian sitasi skripsi, parafrase artikel.

---

## 🛠️ Arsitektur & Teknologi

MVP Kawan Skill dirancang menggunakan pendekatan **Vanilla Stack Modular** agar ringan, cepat dimuat, mudah dipelihara bersama tim, serta sepenuhnya memanfaatkan paket gratis (*zero budget/free-tier*):

| Komponen | Pilihan Teknologi | Peran |
| :--- | :--- | :--- |
| **Frontend** | HTML5 Semantik | Struktur multi-halaman (`index`, `katalog`, `profil`, dll.) |
| **Styling** | Tailwind CSS (CDN) + Custom CSS | Desain responsif bertema gelap modern minimalis |
| **Logika Klien** | Vanilla JS (ES Modules) | State management lokal, navigasi dinamis, dan query API |
| **Database** | PostgreSQL via Supabase | Penyimpanan tabel `profiles`, `skills`, dan `reviews` |
| **Autentikasi** | Supabase Auth | Pendaftaran & autentikasi pengguna berbasis email |
| **File Storage** | Supabase Storage (`avatars`) | Penyimpanan berkas foto profil pengguna |
| **Deployment** | Netlify | Hosting statis otomatis terintegrasi dengan GitHub |

### Identitas Visual:
* **Background Utama**: Dark Navy `#0B1517`
* **Aksen Tukar Skill**: Teal `#2DB7AD`
* **Aksen Minta Tolong**: Orange `#FF8F2E`
* **Tipografi**: Plus Jakarta Sans

---

## 📂 Struktur Repositori

```text
kawan-skill-app/
├── assets/                  # Aset gambar, ikon, dan logo SVG
├── css/
│   └── style.css            # Pengaturan tema gelap, variabel warna, dan utilitas visual
├── js/
│   ├── pages/               # Logika JavaScript spesifik per halaman
│   │   ├── index.js         # Logika kartu unggulan di beranda
│   │   ├── katalog.js       # Pencarian, filter kategori & filter status
│   │   ├── profil.js        # Halaman detail penyedia jasa publik
│   │   ├── profil-saya.js   # Dashboard edit profil & upload foto
│   │   ├── masuk.js         # Form login email
│   │   ├── daftar.js        # Form registrasi pengguna baru
│   │   └── ulasan.js        # Validasi token ulasan & pengiriman rating
│   ├── navbar.js            # Render navigasi global & status session
│   ├── state.js             # Penanganan status login pengguna
│   ├── helper.js            # Pembersih input (sanitize) & helper inisial avatar
│   └── supabase-client.js   # Konfigurasi SDK & pendeteksi status koneksi database
├── .gitignore               # Konfigurasi pengabaian file sensitif Git
├── cara-kerja.html          # Panduan alur transaksi & peringatan keamanan
├── daftar.html              # Halaman registrasi
├── index.html               # Halaman utama (Landing page)
├── katalog.html             # Direktori pencarian profil kawan berbakat
├── masuk.html               # Halaman login
├── profil-saya.html         # Panel pengaturan akun penyedia skill
├── profil.html              # Halaman detail publik penyedia skill
├── schema.sql               # Skrip DDL skema database Supabase
├── tentang.html             # Informasi misi platform Kawan Skill
└── ulasan.html              # Form pengisian ulasan via token link
```

---

## ⚙️ Panduan Menjalankan Proyek Secara Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/USERNAME/kawan-skill-app.git
cd kawan-skill-app
```

### 2. Siapkan Database Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com) dan buat proyek baru (*Free Tier*).
2. Buka menu **SQL Editor**, lalu jalankan seluruh skrip yang tersedia di file **`schema.sql`**.
3. Buka menu **Storage**, klik **New Bucket**:
   * Nama Bucket: `avatars`
   * Centang: **Public Bucket**
   * (Opsional) Batasi ukuran maksimal 5 MB dan tipe MIME `image/jpeg, image/png`.
4. Tambahkan *Storage Policy* di SQL Editor agar foto dapat diunggah:
   ```sql
   CREATE POLICY "Allow public upload to avatars" 
   ON storage.objects FOR INSERT TO public 
   WITH CHECK (bucket_id = 'avatars');

   CREATE POLICY "Allow public select from avatars" 
   ON storage.objects FOR SELECT TO public 
   USING (bucket_id = 'avatars');
   ```

### 3. Konfigurasi Kredensial
Buka file `js/supabase-client.js`, lalu isi variabel URL dan Publishable Key sesuai informasi di *Project Settings -> API*:
```javascript
const SUPABASE_URL = 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = 'sbp_xxxxxxxxxxxx';
```

### 4. Jalankan Aplikasi
Karena proyek ini menggunakan Vanilla JavaScript dengan ES Modules (`type="module"`), buka folder proyek menggunakan ekstensi **Live Server** di VS Code / VS Codium, atau gunakan server statis sederhana:
```bash
# Menggunakan Python
python3 -m http.server 5500

# Atau menggunakan npx serve
npx serve .
```
Buka browser di `http://localhost:5500`.

---

## 👥 Tim Pengembang

Proyek ini dikembangkan dengan dedikasi penuh untuk tugas mata kuliah **Technopreneurship**:
* **Reyhan Pradana** — *Technical Lead & Frontend Architecture*
* **Rekan Teknis** — *Backend & Database Integration*
* **Rekan Marketing** — *Product Validation, Testing & Acquisition*

---

<p align="center">
  Dibuat dengan semangat kolaborasi mahasiswa 🎓 • <i>Kawan Belajar, Kawan Berkarya.</i>
</p>
