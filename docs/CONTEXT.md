# Context & Guideline Proyek: Kawan Skill

## 1. Overview Proyek
- **Nama Proyek**: Kawan Skill (Platform Marketplace Jasa & Kolaborasi Keahlian Antar-Mahasiswa)
- **Target MVP**: Prototyping tugas Technopreneurship (2 bulan, budget max Rp 300.000, demo 10-20 pengguna)
- **Fitur Utama**:
  1. **Minta Tolong (Berbayar)**: Warna aksen Oranye (`#FF8F2E`). Pengunjung publik bisa isi form lalu dialihkan ke pesan WhatsApp penyedia skill. Tidak ada payment gateway internal.
  2. **Tukar Skill (Gratis)**: Warna aksen Teal (`#2DB7AD`). Wajib login email. Dialihkan ke WhatsApp untuk diskusi.

## 2. Tech Stack & Arsitektur (Opsi 2 - Vanilla Stack)
- **Frontend**: HTML5 murni, Tailwind CSS (via CDN/CLI), Vanilla JavaScript.
- **Backend & Database**: Supabase Free Tier (Supabase JavaScript SDK langsung dari client-side JS).
- **Authentication**: Supabase Auth (Email/Password).
- **Hosting / Deploy**: Netlify.
- **Aturan Kode**: JANGAN gunakan Next.js, React, atau framework routing rumit. Setiap halaman web menggunakan file `.html` terpisah (contoh: `index.html`, `katalog.html`, `profil.html`). Pisahkan file JavaScript di folder `js/`.

## 3. Desain & Theme Rules
- **Tema Utama**: Dark Theme (Modern & Minimalis).
- **Background Utama**: `#0B1517`
- **Warna Aksen 1 (Tukar Skill)**: Teal (`#2DB7AD`)
- **Warna Aksen 2 (Minta Tolong/Berbayar)**: Oranye (`#FF8F2E`)
- **Font**: Plus Jakarta Sans / Sans-serif clean.

## 4. Status Ketersediaan Penyedia Skill
- Pilihan status: `Sedang Free`, `Sedang Menerima Pekerjaan`, `Sedang Bertukar Skill`, `Tidak Aktif`, `Liburan`.
- Hanya status `Sedang Free` yang tombol "Minta Tolong" dan "Tukar Skill"-nya aktif.

## 5. Struktur Database Supabase (Draf Utama)
- Tabel `profiles`: `id`, `user_id`, `nama`, `universitas`, `jurusan`, `skills` (array/text), `skill_diincar`, `tarif`, `status`, `whatsapp_no`, `foto_url`, `bio`.
- Tabel `reviews`: `id`, `provider_id`, `rating`, `komentar`, `is_registered_user` (boolean), `created_at`.
