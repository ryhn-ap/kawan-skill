/* KATALOG (katalog.html): pencarian, filter, dan kartu penyedia live dari Supabase.
   TIDAK MENGGUNAKAN DATA DUMMY SAMA SEKALI. */

/* Pilihan filter yang sedang aktif */
const filter = {
	kataKunci: '',
	kategori: 'Semua',
	status: 'semua',            // 'semua' atau nomor status (0 = Sedang Free)
	tarif: 'semua',             // 'semua' | 'sampai-50rb' | '50rb-100rb' | 'di-atas-100rb'
	hanyaTukarSkill: false,
	urutan: 'rating',           // 'rating' | 'tarif'
};

/* Kalau dibuka dari kartu kategori di beranda: katalog.html?kategori=Editing */
const kategoriDariAlamat = new URLSearchParams(location.search).get('kategori');
if (DAFTAR_KATEGORI.includes(kategoriDariAlamat)) filter.kategori = kategoriDariAlamat;

let listPenyediaAktif = [];
let statusSupabase = 'LOADING'; // 'LOADING' | 'OK' | 'NOT_CONFIGURED' | 'ERROR'
let pesanErrorSupabase = '';
let currentUserId = null;

/* Ambil ID pengguna yang sedang login (jika ada) */
async function ambilUserLogin() {
	if (window.supabase) {
		try {
			const { data: { user } } = await window.supabase.auth.getUser();
			if (user) {
				currentUserId = user.id;
				return;
			}
		} catch (err) {
			console.warn('Gagal membaca auth user di katalog:', err);
		}
	}
	if (typeof dataSaya !== 'undefined' && dataSaya && dataSaya.id) {
		currentUserId = dataSaya.id;
	}
}

/* Apakah penyedia ini lolos semua filter? */
function cocokDenganFilter(p) {
	const teksPencarian = (p.nama + ' ' + p.kategori + ' ' + p.skill.join(' ')).toLowerCase();
	if (filter.kataKunci && !teksPencarian.includes(filter.kataKunci.toLowerCase())) return false;
	if (filter.kategori !== 'Semua' && p.kategori !== filter.kategori) return false;
	if (filter.hanyaTukarSkill && !p.bukaTukarSkill) return false;
	if (filter.status !== 'semua' && p.status !== Number(filter.status)) return false;
	if (filter.tarif === 'sampai-50rb' && p.tarifMulai > 50000) return false;
	if (filter.tarif === '50rb-100rb' && (p.tarifMulai < 50000 || p.tarifMulai > 100000)) return false;
	if (filter.tarif === 'di-atas-100rb' && p.tarifMulai <= 100000) return false;
	return true;
}

/* Urutkan hasil: rating tertinggi, atau tarif termurah */
function urutkan(hasil) {
	if (filter.urutan === 'tarif') return hasil.sort((a, b) => a.tarifMulai - b.tarifMulai);
	return hasil.sort((a, b) => b.rating - a.rating || b.jumlahUlasan - a.jumlahUlasan);
}

/* Membuat satu kartu penyedia dari template */
function buatKartu(p) {
	const kartu = $('#tpl-kartu').content.cloneNode(true);
	const status = DAFTAR_STATUS[p.status] || DAFTAR_STATUS[0];

	const avatar = isiTeks(kartu, 'avatar', '');
	avatar.style.setProperty('--c', warnaAvatar(p));

	// Tampilan foto profil jika foto_url ada di database
	if (p.fotoUrl && typeof p.fotoUrl === 'string' && p.fotoUrl.trim() !== '') {
		avatar.style.backgroundImage = 'url(' + p.fotoUrl + ')';
		avatar.style.backgroundPosition = 'center';
		avatar.style.backgroundSize = 'cover';
		avatar.textContent = '';
	} else {
		avatar.style.backgroundImage = '';
		avatar.textContent = inisial(p.nama);
	}

	isiTeks(kartu, 'nama', p.nama);
	isiTeks(kartu, 'kampus', formatKampus(p));

	const wadahSkill = $('[data-isi="daftar-skill"]', kartu);
	p.skill.forEach((namaSkill) => {
		const tag = document.createElement('span');
		tag.className = 'tag';
		tag.textContent = namaSkill;
		wadahSkill.appendChild(tag);
	});

	$('[data-isi="titik"]', kartu).className = 'dot ' + status.titik;
	isiTeks(kartu, 'status', status.nama);
	isiTeks(kartu, 'tarif', rupiah(p.tarifMulai));
	isiTeks(kartu, 'rating', p.rating);
	isiTeks(kartu, 'jumlah-ulasan', p.jumlahUlasan);
	$('[data-isi="badge-tukar"]', kartu).hidden = !p.bukaTukarSkill;

	// Badge penanda independen jika kartu adalah profil milik pengguna yang sedang login
	const isOwner = Boolean(currentUserId && String(currentUserId) === String(p.id));
	const badgeSaya = $('[data-isi="badge-saya"]', kartu);
	if (badgeSaya) {
		badgeSaya.hidden = !isOwner;
	}

	$('[data-isi="link-profil"]', kartu).href = 'profil.html?id=' + encodeURIComponent(p.id) + '&from=katalog';
	return kartu;
}

/* Tampilkan ulang daftar sesuai filter */
function tampilkanDaftar() {
	const wadah = $('#daftar-penyedia');
	const elKosong = $('#hasil-kosong');
	const elJumlah = $('#jumlah-hasil');

	if (statusSupabase === 'NOT_CONFIGURED') {
		wadah.innerHTML = `
			<div style="grid-column: 1 / -1; background: var(--s1); border: 1px dashed var(--org); padding: 32px; border-radius: 16px; text-align: center;">
				<h3 style="color: var(--org); margin-bottom: 8px;">Kredensial Supabase Belum Diisi</h3>
				<p class="mu">Silakan tempelkan <b>SUPABASE_URL</b> dan <b>SUPABASE_ANON_KEY</b> kamu di file <code>js/supabase-client.js</code>.</p>
			</div>
		`;
		elJumlah.textContent = 'Konfigurasi diperlukan';
		elKosong.hidden = true;
		return;
	}

	if (statusSupabase === 'ERROR') {
		wadah.innerHTML = `
			<div style="grid-column: 1 / -1; background: var(--s1); border: 1px solid #772b2b; padding: 32px; border-radius: 16px; text-align: center;">
				<h3 style="color: #ff6b6b; margin-bottom: 8px;">Gagal Terhubung ke Supabase</h3>
				<p class="mu">${pesanErrorSupabase || 'Periksa koneksi jaringan atau skema tabel Supabase kamu.'}</p>
			</div>
		`;
		elJumlah.textContent = 'Gagal memuat';
		elKosong.hidden = true;
		return;
	}

	// Jika database benar-benar kosong (belum ada pendaftar)
	if (listPenyediaAktif.length === 0) {
		wadah.innerHTML = '';
		elJumlah.textContent = '0 kawan berbakat ditemukan';
		elKosong.hidden = false;
		$('h3', elKosong).textContent = 'Belum ada kawan berbakat';
		$('p', elKosong).textContent = 'Database masih kosong. Jadilah kawan pertama yang mendaftarkan keahlian!';
		const btnReset = $('#tombol-reset');
		if (btnReset) {
			btnReset.textContent = 'Daftar Sekarang';
			btnReset.onclick = () => { location.href = 'daftar.html'; };
		}
		return;
	}

	// Filter data
	const hasil = urutkan(listPenyediaAktif.filter(cocokDenganFilter));
	wadah.innerHTML = '';
	hasil.forEach((p) => wadah.appendChild(buatKartu(p)));
	elJumlah.textContent = hasil.length + ' kawan berbakat ditemukan';

	if (hasil.length === 0) {
		elKosong.hidden = false;
		$('h3', elKosong).textContent = 'Belum ada yang cocok';
		$('p', elKosong).textContent = 'Coba kata kunci lain atau longgarkan filter.';
		const btnReset = $('#tombol-reset');
		if (btnReset) {
			btnReset.textContent = 'Reset filter';
			btnReset.onclick = resetFilter;
		}
	} else {
		elKosong.hidden = true;
	}
}

/* Tandai tombol kategori yang aktif */
function tandaiKategoriAktif() {
	$$('#daftar-kategori .chip').forEach((tombol) => {
		tombol.setAttribute('aria-pressed', tombol.dataset.kategori === filter.kategori);
	});
}

/* Memuat data katalog dari database live Supabase */
async function inisialisasiKatalog() {
	// Status loading awal untuk mencegah glitch / data flash
	$('#jumlah-hasil').textContent = 'Memuat data kawan berbakat...';
	$('#daftar-penyedia').innerHTML = `
		<div style="grid-column: 1 / -1; padding: 48px 0; text-align: center; color: var(--mu);">
			<p>Menghubungkan ke database Supabase...</p>
		</div>
	`;
	$('#hasil-kosong').hidden = true;
	tandaiKategoriAktif();

	await ambilUserLogin();

	const res = await ambilSemuaPenyedia();
	statusSupabase = res.status;
	pesanErrorSupabase = res.pesan || '';
	listPenyediaAktif = res.data || [];

	tampilkanDaftar();
}

/* ---------- Pasang aksi pada kontrol ---------- */
function cari() {
	filter.kataKunci = $('#kata-kunci').value.trim();
	tampilkanDaftar();
}
$('#tombol-cari').addEventListener('click', cari);
$('#kata-kunci').addEventListener('keydown', (e) => { if (e.key === 'Enter') cari(); });
$('#kata-kunci').addEventListener('input', (e) => {
	if (e.target.value === '') { filter.kataKunci = ''; tampilkanDaftar(); }
});

$('#daftar-kategori').addEventListener('click', (e) => {
	const tombol = e.target.closest('.chip');
	if (!tombol) return;
	filter.kategori = tombol.dataset.kategori;
	tandaiKategoriAktif();
	tampilkanDaftar();
});

$('#filter-tukar-skill').addEventListener('change', (e) => { filter.hanyaTukarSkill = e.target.checked; tampilkanDaftar(); });
$('#filter-status').addEventListener('change', (e) => { filter.status = e.target.value; tampilkanDaftar(); });
$('#filter-tarif').addEventListener('change', (e) => { filter.tarif = e.target.value; tampilkanDaftar(); });
$('#urutan').addEventListener('change', (e) => { filter.urutan = e.target.value; tampilkanDaftar(); });

function resetFilter() {
	Object.assign(filter, { kataKunci: '', kategori: 'Semua', status: 'semua', tarif: 'semua', hanyaTukarSkill: false, urutan: 'rating' });
	$('#kata-kunci').value = '';
	$('#filter-tukar-skill').checked = false;
	$('#filter-status').value = 'semua';
	$('#filter-tarif').value = 'semua';
	$('#urutan').value = 'rating';
	tandaiKategoriAktif();
	tampilkanDaftar();
}

$('#tombol-reset').addEventListener('click', resetFilter);

// Jalankan inisialisasi awal
inisialisasiKatalog();

// Dengarkan saat client supabase siap
window.addEventListener('supabase:ready', () => {
	inisialisasiKatalog();
});

