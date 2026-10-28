/* FORM WHATSAPP di profil.html: dialog Minta Tolong (tanpa login), Tukar Skill (wajib login),
   dan ajakan masuk. Isi form TIDAK disimpan, hanya disusun menjadi teks pesan WhatsApp.
   Fungsi siapkanFormWhatsapp(penyedia) dipanggil dari js/pages/profil.js. */

const dialogMinta = $('#dlg-minta-tolong');
const dialogTukar = $('#dlg-tukar-skill');
const dialogMasukDulu = $('#dlg-masuk-dulu');

const nilai = (id) => $('#' + id).value.trim();    // isi kolom form berdasarkan id

/* Membuka WhatsApp dengan nomor tujuan dan pesan yang sudah terisi. */
function bukaWhatsapp(nomor, pesan) {
	const cleanPhone = normalisasiNomorWa(nomor);
	if (!cleanPhone) {
		tampilkanToast('Nomor WhatsApp penyedia belum tersedia.');
		return;
	}
	const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(pesan)}`;
	window.open(url, '_blank', 'noopener');
}

/* Mengisi <select> dengan pilihan skill */
function isiPilihanSkill(select, teksPilihan) {
	select.innerHTML = '';
	teksPilihan.forEach((teks) => {
		const pilihan = document.createElement('option');
		pilihan.textContent = teks;
		select.appendChild(pilihan);
	});
}

function siapkanFormWhatsapp(penyedia) {
	$$('[data-nama-penyedia]').forEach((el) => { el.textContent = penyedia.nama; });

	/* ---------- Minta Tolong ---------- */
	isiPilihanSkill($('#mt-skill'), skillBertarif(penyedia).map((s) => s.nama + ', ' + rupiah(s.tarif)));

	function susunPesanMintaTolong() {
		return 'Halo ' + penyedia.nama + ', aku ' + (nilai('mt-nama') || '...') + ' dari Kawan Skill. ' +
			'Aku mau minta tolong soal ' + $('#mt-skill').value + '.\n\n' +
			'Detail: ' + (nilai('mt-detail') || '...') + '\n' +
			'Tenggat: ' + (nilai('mt-tenggat') || 'fleksibel') + '\n\n' +
			'Bisa diskusi dulu? Makasih!';
	}
	function perbaruiMintaTolong() {
		$('#mt-pratinjau').textContent = susunPesanMintaTolong();
		$('#mt-kirim').disabled = !(nilai('mt-nama') && nilai('mt-detail'));   // nama dan detail wajib diisi
	}
	$('#btn-minta-tolong').addEventListener('click', () => {
		dialogMinta.showModal();
		perbaruiMintaTolong();
	});
	dialogMinta.addEventListener('input', perbaruiMintaTolong);
	$('#mt-kirim').addEventListener('click', () => bukaWhatsapp(penyedia.whatsapp, susunPesanMintaTolong()));

	/* ---------- Tukar Skill ---------- */
	isiPilihanSkill($('#tk-pelajari'), penyedia.skill);

	function susunPesanTukarSkill() {
		const nama = nilai('tk-nama');
		const slug = nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'username';
		const tambahan = nilai('tk-pesan') ? 'Pesan: ' + nilai('tk-pesan') + '\n\n' : '';
		return 'Halo ' + penyedia.nama + ', aku ' + (nama || '...') + ' dari Kawan Skill. ' +
			'Aku bisa ajarin ' + (nilai('tk-ajarkan') || '...') + ', dan aku mau belajar ' + $('#tk-pelajari').value + ' dari kamu.\n\n' +
			'Profilku: kawanskill.vercel.app/u/' + slug + '\n' +      // link profil: contoh saja
			tambahan + 'Kira-kira ada waktu buat tukar skill? Makasih!';
	}
	function perbaruiTukarSkill() {
		$('#tk-pratinjau').textContent = susunPesanTukarSkill();
		$('#tk-kirim').disabled = !(nilai('tk-nama') && nilai('tk-ajarkan'));
	}
	$('#btn-tukar-skill').addEventListener('click', () => {
		if (!sudahLogin) {                       // belum login: tampilkan ajakan masuk
			dialogMasukDulu.showModal();
			return;
		}
		$('#tk-nama').value = dataSaya.nama;
		dialogTukar.showModal();
		perbaruiTukarSkill();
	});
	dialogTukar.addEventListener('input', perbaruiTukarSkill);
	$('#tk-kirim').addEventListener('click', () => bukaWhatsapp(penyedia.whatsapp, susunPesanTukarSkill()));
}

/* ---------- Umum ---------- */

/* Dari dialog ajakan masuk ke halaman Masuk; setelah login, kembali ke profil ini */
$('#btn-ke-masuk').addEventListener('click', () => {
	kembaliKe = alamatSekarang();
	simpan();
	location.href = 'masuk.html';
});

/* Tutup dialog: tombol bertanda data-tutup, atau klik area gelap di luar kotak dialog */
$$('dialog').forEach((dialog) => {
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog || e.target.closest('[data-tutup]')) dialog.close();
	});
});
