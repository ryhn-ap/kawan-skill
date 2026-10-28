/* HALAMAN ULASAN LEWAT LINK KHUSUS (ulasan.html?token=<kode>)
   Halaman ini DAPAT DIAKSES PUBLIK (baik tamu maupun pengguna terdaftar).
   Mendukung integrasi Supabase Database jika token ulasan ada di tabel reviews. */

const params = new URLSearchParams(location.search);
const token = params.get('token') || params.get('id') || params.get('target') || '';
const TOKEN_DEMO = { demo1234: 'minta-tolong', demotukar: 'tukar-skill' };

let infoUlasanDb = null;
let jenisLink = null;
let sudahTerpakai = false;
let namaPenyedia = 'Kawan Berbakat';
let skor = 0; // bintang yang dipilih (0 = belum memilih)

/* Tampilkan satu bagian saja, sembunyikan sisanya */
function tampilkanBagian(id) {
	$$('.ac > section').forEach((bagian) => { bagian.hidden = bagian.id !== id; });
}

/* ---------- Form ulasan ---------- */
function perbaruiTombolKirim() {
	const lengkap = skor > 0 && $('#u-nama').value.trim() && $('#u-isi').value.trim().length >= 10;
	$('#u-kirim').disabled = !lengkap;
}

function siapkanForm() {
	tampilkanBagian('u-form');
	$('#u-nama-penyedia').textContent = namaPenyedia;

	if (sudahLogin) {
		$('#u-label-nama').textContent = 'Nama (dari akunmu)';
		$('#u-nama').value = dataSaya.nama || 'Pengguna';
		$('#u-nama').readOnly = false; // Pengguna tetap bisa menyesuaikan nama jika mau
	}

	$('#u-bintang').addEventListener('click', (e) => {
		const tombol = e.target.closest('[data-skor]');
		if (!tombol) return;
		skor = Number(tombol.dataset.skor);
		$$('#u-bintang button').forEach((b) => b.classList.toggle('on', Number(b.dataset.skor) <= skor));
		perbaruiTombolKirim();
	});
	$('#u-nama').addEventListener('input', perbaruiTombolKirim);
	$('#u-isi').addEventListener('input', perbaruiTombolKirim);

	$('#u-kirim').addEventListener('click', async () => {
		const btnKirim = $('#u-kirim');
		const teksAsli = btnKirim.textContent;
		btnKirim.disabled = true;
		btnKirim.textContent = 'Mengirim...';

		const namaPengulas = $('#u-nama').value.trim();
		const komentarPengulas = $('#u-isi').value.trim();
		const labelPengulas = sudahLogin ? 'Pengguna Terdaftar' : 'Pengguna Eksternal';

		// Jika Supabase aktif dan token ditemukan di DB
		if (window.supabase && infoUlasanDb) {
			try {
				const { error: errUpdate } = await window.supabase
					.from('reviews')
					.update({
						nama_pengulas: namaPengulas,
						rating: skor,
						komentar: komentarPengulas,
						tipe_pengulas: labelPengulas,
						is_used: true
					})
					.eq('id', infoUlasanDb.id);

				if (errUpdate) throw errUpdate;
			} catch (err) {
				console.error('Gagal kirim ulasan ke Supabase:', err);
				tampilkanToast('Gagal mengirim ulasan: ' + err.message);
				btnKirim.disabled = false;
				btnKirim.textContent = teksAsli;
				return;
			}
		}

		// Update link di localStorage jika ada
		const linkTersimpan = dataSaya.linkUlasan.find((l) => l.kode === token);
		if (linkTersimpan) {
			linkTersimpan.terpakai = true;
			simpan();
		}

		$('#u-ringkasan').textContent = 'Ulasan ' + skor + ' bintang untuk ' + namaPenyedia +
			' sudah berhasil terkirim dengan status ' + labelPengulas + '. Terima kasih telah memberikan penilaian!';
		tampilkanBagian('u-terima-kasih');
	});
}

/* Inisialisasi pengecekan token ulasan */
async function inisialisasiHalamanUlasan() {
	if (!token) {
		$('#u-alasan').textContent = 'Parameter token ulasan tidak ditemukan pada alamat tautan.';
		tampilkanBagian('u-tidak-valid');
		return;
	}

	// 1. Cek di Supabase jika client siap
	if (window.supabase) {
		try {
			const { data, error } = await window.supabase
				.from('reviews')
				.select('id, profile_id, nama_pengulas, rating, is_used, token_ulasan, tipe_pengulas, profiles(name)')
				.eq('token_ulasan', token)
				.maybeSingle();

			if (!error && data) {
				infoUlasanDb = data;
				sudahTerpakai = !!data.is_used;
				jenisLink = data.tipe_pengulas === 'Pengguna Terdaftar' ? 'tukar-skill' : 'minta-tolong';
				if (data.profiles && data.profiles.name) {
					namaPenyedia = data.profiles.name;
				}
			}
		} catch (err) {
			console.warn('Gagal cek token ulasan Supabase:', err);
		}
	}

	// 2. Fallback cek ke local/demo jika di DB belum ketemu
	if (!infoUlasanDb) {
		const linkTersimpan = dataSaya.linkUlasan.find((link) => link.kode === token);
		if (linkTersimpan) {
			jenisLink = linkTersimpan.jenis;
			sudahTerpakai = !!linkTersimpan.terpakai;
			namaPenyedia = dataSaya.nama || 'Kawan Berbakat';
		} else if (TOKEN_DEMO[token]) {
			jenisLink = TOKEN_DEMO[token];
			sudahTerpakai = false;
			namaPenyedia = 'Kawan Berbakat';
		}
	}

	// 3. Evaluasi tampilan
	if (!jenisLink && !infoUlasanDb) {
		$('#u-alasan').textContent = 'Link ulasan tidak ditemukan atau sudah tidak berlaku.';
		tampilkanBagian('u-tidak-valid');
	} else if (sudahTerpakai) {
		$('#u-alasan').textContent = 'Link ini sudah dipakai untuk mengirim ulasan sebelumnya.';
		tampilkanBagian('u-tidak-valid');
	} else if (jenisLink === 'tukar-skill' && !sudahLogin) {
		// Halaman ulasan Tukar Skill memerlukan login pengulas
		tampilkanBagian('u-butuh-login');
		$('#btn-ke-masuk').onclick = () => {
			kembaliKe = alamatSekarang();
			simpan();
			location.href = 'masuk.html';
		};
	} else {
		siapkanForm();
	}
}

// Inisialisasi awal
inisialisasiHalamanUlasan();

window.addEventListener('supabase:ready', () => {
	inisialisasiHalamanUlasan();
});
