/* STATE: status login dan data profil pengguna.
   Tersinkronisasi dengan Supabase Auth + Database, dengan fallback ke localStorage. */

const KUNCI_STORAGE = 'kawanskill-proto-v2';

/* Bentuk data profil milik pengguna yang login */
function buatDataSayaAwal() {
	return {
		id: null,
		nama: '', kampus: '', jurusan: '', kategori: 'Desain Grafis', bio: '', whatsapp: '',
		bukaTukarSkill: true,
		status: 0,                                  // nomor status, lihat DAFTAR_STATUS di data.js
		foto: null,                                 // gambar URL atau null
		skill: [{ nama: '', tarif: 0 }],
		portofolio: [null, null, null],             // 3 slot gambar
		linkUlasan: [],                             // { kode, jenis: 'minta-tolong' | 'tukar-skill', terpakai: true/false }
	};
}

let sudahLogin = false;
let userAuth = null;
let kembaliKe = '';                             // halaman tujuan setelah login (misalnya 'profil.html?id=3')
let dataSaya = buatDataSayaAwal();

/* Baca data cadangan yang tersimpan di localStorage (kalau ada) */
try {
	const tersimpan = JSON.parse(localStorage.getItem(KUNCI_STORAGE) || 'null');
	if (tersimpan) {
		sudahLogin = !!tersimpan.sudahLogin;
		kembaliKe = tersimpan.kembaliKe || '';
		userAuth = tersimpan.userAuth || null;
		dataSaya = Object.assign(buatDataSayaAwal(), tersimpan.dataSaya || {});
	}
} catch (error) { /* data rusak: pakai data awal */ }

/* Simpan state ke localStorage */
function simpan() {
	try {
		localStorage.setItem(KUNCI_STORAGE, JSON.stringify({ sudahLogin, kembaliKe, dataSaya, userAuth }));
	} catch (error) {
		tampilkanToast('Penyimpanan penuh, kurangi ukuran data');
	}
}

/* Pesan toast yang ingin ditampilkan di halaman berikutnya (karena halaman akan berpindah) */
function simpanPesanBerikutnya(pesan) {
	try { sessionStorage.setItem('pesan-berikutnya', pesan); } catch (error) { }
}
function ambilPesanBerikutnya() {
	try {
		const pesan = sessionStorage.getItem('pesan-berikutnya');
		sessionStorage.removeItem('pesan-berikutnya');
		return pesan;
	} catch (error) { return null; }
}

/* Alamat halaman sekarang tanpa folder, misalnya "profil.html?id=3" */
function alamatSekarang() {
	return location.pathname.split('/').pop() + location.search;
}

/* Sinkronisasi sesi Supabase secara berkala atau saat inisialisasi */
async function sinkronkanSesiSupabase() {
	if (!window.supabase) return;
	try {
		const { data: { session }, error } = await window.supabase.auth.getSession();
		if (session && session.user) {
			sudahLogin = true;
			userAuth = session.user;
			if (!dataSaya.id) dataSaya.id = session.user.id;
			if (!dataSaya.nama && session.user.user_metadata?.name) {
				dataSaya.nama = session.user.user_metadata.name;
			}
			simpan();
			if (typeof aturNavbar === 'function') aturNavbar();
		} else if (!session && window.isSupabaseConfigured && window.isSupabaseConfigured()) {
			// Jika Supabase aktif namun tidak ada sesi
			sudahLogin = false;
			userAuth = null;
			simpan();
			if (typeof aturNavbar === 'function') aturNavbar();
		}
	} catch (err) {
		console.warn('Gagal membaca sesi Supabase:', err);
	}
}

// Dengarkan event supabase siap
window.addEventListener('supabase:ready', () => {
	sinkronkanSesiSupabase();
});
if (window.supabase) {
	sinkronkanSesiSupabase();
}

/* Dipanggil setelah form Masuk / Daftar berhasil */
function selesaiLogin(nama, pesan, userObj = null) {
	dataSaya.nama = nama;
	if (userObj) {
		userAuth = userObj;
		dataSaya.id = userObj.id;
	}
	sudahLogin = true;
	const tujuan = kembaliKe || 'profil-saya.html';
	kembaliKe = '';
	simpan();
	simpanPesanBerikutnya(pesan);
	location.href = tujuan;
}

/* Proses keluar akun */
async function keluar() {
	if (window.supabase) {
		try {
			await window.supabase.auth.signOut();
		} catch (err) {
			console.warn('Gagal sign out dari Supabase:', err);
		}
	}
	sudahLogin = false;
	userAuth = null;
	kembaliKe = '';
	dataSaya = buatDataSayaAwal();
	simpan();
	simpanPesanBerikutnya('Kamu sudah keluar');
	location.href = 'index.html';
}
