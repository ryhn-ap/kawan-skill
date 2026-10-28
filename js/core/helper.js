/* HELPER: fungsi kecil yang dipakai banyak halaman. Dimuat paling awal. */

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

/* Standarisasi nomor telepon ke format WhatsApp internasional (62xxxx) */
function normalisasiNomorWa(nomor) {
	if (!nomor) return '';
	let clean = String(nomor).replace(/[^0-9]/g, '');
	if (clean.startsWith('0')) {
		clean = '62' + clean.slice(1);
	} else if (clean.startsWith('8')) {
		clean = '62' + clean;
	}
	return clean;
}

/* Mengisi teks elemen bertanda data-isi="nama" di dalam sebuah template yang sudah disalin.
   Contoh: isiTeks(kartu, 'nama', 'Aulia Rahma') mengisi <h3 data-isi="nama"></h3> */
function isiTeks(akar, nama, teks) {
	const elemen = $('[data-isi="' + nama + '"]', akar);
	elemen.textContent = teks;
	return elemen;
}

/* Pesan kecil di bawah layar (elemen <div id="toast"> ada di setiap halaman) */
function tampilkanToast(pesan, durasi = 2200) {
	const toast = $('#toast');
	if (!toast) return;
	toast.textContent = pesan;
	toast.classList.add('on');
	clearTimeout(tampilkanToast.timer);
	tampilkanToast.timer = setTimeout(() => toast.classList.remove('on'), durasi);
}

/* Modal Lightbox untuk Pratinjau Gambar Portofolio */
function bukaLightbox(urlGambar, altTeks = 'Pratinjau Portofolio') {
	let modal = $('#lightbox-modal');
	if (!modal) {
		modal = document.createElement('div');
		modal.id = 'lightbox-modal';
		modal.style.cssText = `
			position: fixed;
			inset: 0;
			z-index: 9999;
			background: rgba(0, 0, 0, 0.85);
			backdrop-filter: blur(8px);
			-webkit-backdrop-filter: blur(8px);
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
			opacity: 0;
			transition: opacity 0.2s ease;
		`;

		modal.innerHTML = `
			<button id="lightbox-close" aria-label="Tutup pratinjau" style="
				position: absolute;
				top: 20px;
				right: 24px;
				background: rgba(255, 255, 255, 0.15);
				border: 1px solid rgba(255, 255, 255, 0.25);
				color: #fff;
				width: 42px;
				height: 42px;
				border-radius: 50%;
				display: grid;
				place-items: center;
				font-size: 1.4rem;
				line-height: 1;
				cursor: pointer;
				transition: background 0.2s, transform 0.2s;
			">✕</button>
			<img id="lightbox-img" src="" alt="" style="
				max-height: 90vh;
				max-width: 90vw;
				object-fit: contain;
				border-radius: 14px;
				box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
				transform: scale(0.96);
				transition: transform 0.2s ease;
			">
		`;

		document.body.appendChild(modal);

		// Event listener tutup
		const tutupLightbox = () => {
			modal.style.opacity = '0';
			const img = $('#lightbox-img', modal);
			if (img) img.style.transform = 'scale(0.96)';
			document.body.style.overflow = '';
			setTimeout(() => { modal.style.display = 'none'; }, 200);
			document.removeEventListener('keydown', onKeyDown);
		};

		const onKeyDown = (e) => {
			if (e.key === 'Escape') tutupLightbox();
		};

		modal.addEventListener('click', (e) => {
			if (e.target === modal || e.target.id === 'lightbox-close' || e.target.closest('#lightbox-close')) {
				tutupLightbox();
			}
		});

		modal._tutup = tutupLightbox;
		modal._onKeyDown = onKeyDown;
	}

	const img = $('#lightbox-img', modal);
	img.src = urlGambar;
	img.alt = altTeks;

	modal.style.display = 'flex';
	// Force reflow
	void modal.offsetHeight;
	modal.style.opacity = '1';
	img.style.transform = 'scale(1)';
	document.body.style.overflow = 'hidden';

	document.addEventListener('keydown', modal._onKeyDown);
}
