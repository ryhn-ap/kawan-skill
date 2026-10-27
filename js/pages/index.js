/* BERANDA (index.html): Menampilkan statistik kategori live dari Supabase & animasi kartu demo */

/* 1. Hitung jumlah kawan berbakat di tiap kartu kategori secara dinamis dari Supabase */
async function perbaruiJumlahKategori() {
	const elemenKategori = $$('[data-jumlah-kategori]');
	if (elemenKategori.length === 0) return;

	// Inisialisasi tampilan awal sebelum query selesai (mencegah glitch/flash)
	elemenKategori.forEach((el) => {
		el.textContent = 'Memuat...';
	});

	if (typeof ambilSemuaPenyedia !== 'function') return;

	const hasil = await ambilSemuaPenyedia();
	const daftar = hasil.data || [];

	elemenKategori.forEach((elemen) => {
		const kategori = elemen.dataset.jumlahKategori;
		const jumlah = daftar.filter((p) => p.kategori === kategori).length;
		elemen.textContent = jumlah + ' kawan berbakat';
	});
}

perbaruiJumlahKategori();

// Dengarkan saat client supabase siap
window.addEventListener('supabase:ready', () => {
	perbaruiJumlahKategori();
});

/* 2. Animasi kartu contoh profil: miring mengikuti kursor + cahaya yang mengikuti kursor */
const kartuContoh = $('.demo');
const penggunaMintaGerakKecil = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (kartuContoh && !penggunaMintaGerakKecil) {
	kartuContoh.addEventListener('pointermove', (e) => {
		const kotak = kartuContoh.getBoundingClientRect();
		const x = (e.clientX - kotak.left) / kotak.width;
		const y = (e.clientY - kotak.top) / kotak.height;
		kartuContoh.style.setProperty('--mx', x * 100 + '%');
		kartuContoh.style.setProperty('--my', y * 100 + '%');
		kartuContoh.style.setProperty('--rx', (0.5 - y) * 8 + 'deg');
		kartuContoh.style.setProperty('--ry', (x - 0.5) * 8 + 'deg');
	});
	kartuContoh.addEventListener('pointerleave', () => {
		kartuContoh.style.setProperty('--rx', '0deg');
		kartuContoh.style.setProperty('--ry', '0deg');
	});
}

