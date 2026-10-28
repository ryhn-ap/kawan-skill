-- SKEMA DATABASE SUPABASE - PROYEK KAWAN SKILL

-- 1. TABEL PROFIL PENYEDIA SKILL
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kampus TEXT,
  jurusan TEXT,
  kategori_utama TEXT,
  bio TEXT,
  whatsapp TEXT,
  status INT2 DEFAULT 0, -- 0: Sedang Free, 1: Sedang Menerima Pekerjaan, 2: Sedang Bertukar Skill, 3: Tidak Aktif, 4: Liburan
  terbuka_tukar_skill BOOLEAN DEFAULT true,
  foto_url TEXT,
  portofolio_urls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL DAFTAR SKILL & TARIF
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nama_skill TEXT NOT NULL,
  tarif NUMERIC DEFAULT 0
);

-- 3. TABEL ULASAN
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nama_pengulas TEXT NOT NULL,
  rating INT2 CHECK (rating >= 1 AND rating <= 5),
  komentar TEXT,
  tipe_pengulas TEXT DEFAULT 'Pengguna Eksternal', -- 'Pengguna Terdaftar' / 'Pengguna Eksternal'
  token_ulasan TEXT UNIQUE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);