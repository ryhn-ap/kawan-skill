/* HALAMAN ULASAN LEWAT LINK KHUSUS (ulasan.html?token=<kode>)
   Empat tampilan ada di ulasan.html (bagian u-butuh-login, u-tidak-valid, u-form, u-terima-kasih).
   File ini hanya memilih bagian mana yang ditampilkan dan mengatur form.
   Token demo: demo1234 (dari Minta Tolong) dan demotukar (dari Tukar Skill, wajib login). */

const token = new URLSearchParams(location.search).get('token') || '';
const TOKEN_DEMO = { demo1234: 'minta-tolong', demotukar: 'tukar-skill' };

/* Cari token di link yang dibuat penyedia (Profil Saya), kalau tidak ada coba token demo */
const linkTersimpan = dataSaya.linkUlasan.find((link) => link.kode === token);
const jenisLink = linkTersimpan ? linkTersimpan.jenis : TOKEN_DEMO[token];
const sudahTerpakai = linkTersimpan ? linkTersimpan.terpakai : false;
const namaPenyedia = dataSaya.nama || 'Kawan Berbakat';
const labelPengulas = sudahLogin ? 'Pengguna terdaftar' : 'Lewat link ulasan';

let skor = 0;                                          // bintang yang dipilih (0 = belum memilih)

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

  if (sudahLogin) {                                    // pengulas login: nama diambil dari akun
    $('#u-label-nama').textContent = 'Nama (dari akunmu)';
    $('#u-nama').value = dataSaya.nama || 'Pengguna';
    $('#u-nama').readOnly = true;
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

  $('#u-kirim').addEventListener('click', () => {
    if (linkTersimpan) {                               // tandai link sudah dipakai (token demo tidak ditandai)
      linkTersimpan.terpakai = true;
      simpan();
    }
    $('#u-ringkasan').textContent = 'Ulasan ' + skor + ' bintang untuk ' + namaPenyedia +
      ' sudah terkirim (simulasi) dengan label ' + labelPengulas + '. Link ini tidak bisa dipakai lagi.';
    tampilkanBagian('u-terima-kasih');
  });
}

/* ---------- Tentukan tampilan awal ---------- */
if (!jenisLink) {
  $('#u-alasan').textContent = 'Link tidak ditemukan atau sudah tidak berlaku.';
  tampilkanBagian('u-tidak-valid');
} else if (sudahTerpakai) {
  $('#u-alasan').textContent = 'Link ini sudah dipakai untuk mengirim ulasan.';
  tampilkanBagian('u-tidak-valid');
} else if (jenisLink === 'tukar-skill' && !sudahLogin) {
  tampilkanBagian('u-butuh-login');
  $('#btn-ke-masuk').addEventListener('click', () => {
    kembaliKe = alamatSekarang();                      // setelah login, kembali ke halaman ulasan ini
    simpan();
    location.href = 'masuk.html';
  });
} else {
  siapkanForm();
}
