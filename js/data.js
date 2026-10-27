// DATA: Mengelola konfigurasi kategori, status, dan pemanggilan data live ke Supabase.

const DAFTAR_KATEGORI = ['Desain Grafis', 'Web & Aplikasi', 'Bahasa Pemrograman', 'Editing', 'Penulisan'];

/* Status penyedia. Nomor status = urutan di array ini (0 sampai 4).
   bisaMintaTolong / bisaTukarSkill: apakah tombolnya aktif di halaman profil.
   titik: kelas CSS untuk titik warna ('on' = teal, 'vc' = oranye, '' = abu-abu). */
const DAFTAR_STATUS = [
	{ nama: 'Sedang Free', bisaMintaTolong: true, bisaTukarSkill: true, titik: 'on' },
	{ nama: 'Sedang Menerima Pekerjaan', bisaMintaTolong: false, bisaTukarSkill: false, titik: 'vc' },
	{ nama: 'Sedang Bertukar Skill', bisaMintaTolong: false, bisaTukarSkill: false, titik: 'vc' },
	{ nama: 'Tidak Aktif', bisaMintaTolong: false, bisaTukarSkill: false, titik: '' },
	{ nama: 'Liburan', bisaMintaTolong: false, bisaTukarSkill: false, titik: '' },
];

let DAFTAR_PENYEDIA = [];

/* Transformasi data mentah dari query profiles + skills + reviews ke objek penyedia */
function transformProfil(row) {
	const skillsList = Array.isArray(row.skills) ? row.skills : [];
	const skillNames = skillsList.map((s) => s.nama_skill).filter(Boolean);

	let tarifMulai = 0;
	if (skillsList.length > 0) {
		const tarifArr = skillsList.map((s) => Number(s.tarif) || 0);
		tarifMulai = Math.min(...tarifArr);
	}

	const reviewsList = Array.isArray(row.reviews) ? row.reviews : [];
	let ratingRataRata = 0;
	if (reviewsList.length > 0) {
		const totalRating = reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
		ratingRataRata = Number((totalRating / reviewsList.length).toFixed(1));
	}

	return {
		id: row.id,
		nama: row.name || 'Mahasiswa Kawan',
		kampus: row.kampus || 'Kampus',
		jurusan: row.jurusan || '',
		kategori: row.kategori_utama || 'Desain Grafis',
		bio: row.bio || '',
		whatsapp: row.whatsapp || '',
		status: typeof row.status === 'number' ? row.status : 0,
		bukaTukarSkill: row.terbuka_tukar_skill !== false,
		fotoUrl: row.foto_url || null,
		skill: skillNames.length > 0 ? skillNames : ['Umum'],
		skillsRelasi: skillsList,
		reviewsRelasi: reviewsList,
		tarifMulai: tarifMulai,
		rating: ratingRataRata > 0 ? ratingRataRata : 5.0,
		jumlahUlasan: reviewsList.length
	};
}

/* Mengambil seluruh penyedia live dari Supabase dengan relasi skills & reviews */
async function ambilSemuaPenyedia() {
	if (!window.supabase || (window.isSupabaseConfigured && !window.isSupabaseConfigured())) {
		return {
			status: 'NOT_CONFIGURED',
			pesan: 'Supabase belum dikonfigurasi. Silakan atur SUPABASE_URL dan SUPABASE_ANON_KEY di js/supabase-client.js',
			data: []
		};
	}

	try {
		const { data, error } = await window.supabase
			.from('profiles')
			.select(`
				id, name, kampus, jurusan, kategori_utama, bio, whatsapp,
				status, terbuka_tukar_skill, foto_url, created_at,
				skills (id, nama_skill, tarif),
				reviews (id, nama_pengulas, rating, komentar, tipe_pengulas, created_at)
			`)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error memuat data profil dari Supabase:', error);
			return {
				status: 'ERROR',
				pesan: error.message || 'Gagal mengambil data dari Supabase.',
				data: []
			};
		}

		const hasil = (data || []).map(transformProfil);
		DAFTAR_PENYEDIA = hasil;
		return {
			status: 'OK',
			pesan: '',
			data: hasil
		};
	} catch (err) {
		console.error('Koneksi Supabase error:', err);
		return {
			status: 'ERROR',
			pesan: err.message || 'Terjadi kesalahan saat terhubung ke server.',
			data: []
		};
	}
}

/* Mengambil satu profil penyedia secara live dari Supabase berdasarkan ID (UUID) */
async function ambilPenyediaById(id) {
	if (!id) return null;

	if (!window.supabase || (window.isSupabaseConfigured && !window.isSupabaseConfigured())) {
		return {
			status: 'NOT_CONFIGURED',
			pesan: 'Supabase belum dikonfigurasi di js/supabase-client.js',
			data: null
		};
	}

	try {
		const { data, error } = await window.supabase
			.from('profiles')
			.select(`
				id, name, kampus, jurusan, kategori_utama, bio, whatsapp,
				status, terbuka_tukar_skill, foto_url, created_at,
				skills (id, nama_skill, tarif),
				reviews (id, nama_pengulas, rating, komentar, tipe_pengulas, created_at)
			`)
			.eq('id', id)
			.maybeSingle();

		if (error) {
			console.error('Error saat mengambil detail profil:', error);
			return {
				status: 'ERROR',
				pesan: error.message,
				data: null
			};
		}

		if (!data) {
			return {
				status: 'NOT_FOUND',
				pesan: 'Profil penyedia tidak ditemukan.',
				data: null
			};
		}

		return {
			status: 'OK',
			pesan: '',
			data: transformProfil(data)
		};
	} catch (err) {
		console.error('Koneksi Supabase error:', err);
		return {
			status: 'ERROR',
			pesan: err.message,
			data: null
		};
	}
}

/* Mengembalikan daftar keahlian bertarif untuk penyedia */
function skillBertarif(penyedia) {
	if (penyedia.skillsRelasi && penyedia.skillsRelasi.length > 0) {
		return penyedia.skillsRelasi.map((s) => ({
			nama: s.nama_skill,
			tarif: Number(s.tarif) || 0
		}));
	}
	if (penyedia.skill && Array.isArray(penyedia.skill)) {
		return penyedia.skill.map((nama) => ({
			nama: nama,
			tarif: Number(penyedia.tarifMulai) || 0
		}));
	}
	return [];
}

/* Warna avatar: teal kalau membuka tukar skill, oranye kalau tidak */
function warnaAvatar(penyedia) {
	return penyedia.bukaTukarSkill ? '#2DB7AD' : '#FF8F2E';
}