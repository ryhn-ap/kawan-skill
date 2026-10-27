/* HELPER: fungsi kecil yang dipakai banyak halaman. Dimuat paling awal. */

// /* Cegah efek scroll patah/cepat saat navigasi antar-halaman */
// if ('scrollRestoration' in history) {
// 	history.scrollRestoration = 'manual';
// }
// window.scrollTo(0, 0);

/* Singkatan untuk mencari elemen: $('#id') = satu elemen, $$('.kelas') = semua elemen yang cocok */
const $ = (selector, dalam = document) => dalam.querySelector(selector);
const $$ = (selector, dalam = document) => Array.from(dalam.querySelectorAll(selector));

/* 75000 -> "Rp 75.000" */
const rupiah = (angka) => 'Rp ' + Number(angka).toLocaleString('id-ID');

/* "Aulia Rahma" -> "AR" (untuk avatar) */
const inisial = (nama) =>
	nama.split(' ').filter(Boolean).map((kata) => kata[0]).slice(0, 2).join('').toUpperCase();

/* Format tampilan kampus: "Jurusan, Universitas" atau "Universitas" jika jurusan kosong */
const formatKampus = (p) => `${p && p.jurusan ? p.jurusan + ', ' : ''}${(p && p.kampus) || ''}`;

/* Mengisi teks elemen bertanda data-isi="nama" di dalam sebuah template yang sudah disalin.
   Contoh: isiTeks(kartu, 'nama', 'Aulia Rahma') mengisi <h3 data-isi="nama"></h3> */
function isiTeks(akar, nama, teks) {
	const elemen = $('[data-isi="' + nama + '"]', akar);
	elemen.textContent = teks;
	return elemen;
}

/* Pesan kecil di bawah layar (elemen <div id="toast"> ada di setiap halaman) */
function tampilkanToast(pesan) {
	const toast = $('#toast');
	toast.textContent = pesan;
	toast.classList.add('on');
	clearTimeout(tampilkanToast.timer);
	tampilkanToast.timer = setTimeout(() => toast.classList.remove('on'), 2200);
}
