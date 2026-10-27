/* PROFIL SAYA (profil-saya.html): Pengguna mengatur profil, status, skill dan tarif ke Supabase Database.
   MURNI MENGGUNAKAN DATA SUPABASE & SUPABASE STORAGE BUCKET 'avatars'. */

let idPenggunaAktif = null;

/* Mengatur tombol kembali dinamis berdasarkan parameter 'from' */
function aturTombolKembali() {
	const tombolKembali = $('#back-btn') || $('.back');
	if (!tombolKembali) return;

	const fromPage = new URLSearchParams(window.location.search).get('from');

	if (fromPage === 'beranda') {
		tombolKembali.href = 'index.html';
		tombolKembali.textContent = '< Kembali ke beranda';
	} else if (fromPage === 'katalog') {
		tombolKembali.href = 'katalog.html';
		tombolKembali.textContent = '< Kembali ke katalog';
	} else {
		// Fallback jika dibuka langsung atau parameter kosong
		if (window.history.length > 1) {
			tombolKembali.href = '#';
			tombolKembali.textContent = '< Kembali';
			tombolKembali.addEventListener('click', (e) => {
				e.preventDefault();
				window.history.back();
			});
		} else {
			tombolKembali.href = 'katalog.html';
			tombolKembali.textContent = '< Kembali ke katalog';
		}
	}
}

async function cekAutentikasi() {
	if (window.supabase) {
		try {
			const { data: { session } } = await window.supabase.auth.getSession();
			if (!session || !session.user) {
				kembaliKe = 'profil-saya.html';
				simpan();
				location.href = 'masuk.html';
				return false;
			}
			idPenggunaAktif = session.user.id;
			dataSaya.id = idPenggunaAktif;
			return true;
		} catch (err) {
			console.warn('Gagal cek session Supabase:', err);
		}
	}

	if (!sudahLogin) {
		kembaliKe = 'profil-saya.html';
		simpan();
		location.href = 'masuk.html';
		return false;
	}
	return true;
}

async function siapkanHalaman() {
	aturTombolKembali();

	const terautentikasi = await cekAutentikasi();
	if (!terautentikasi) return;

	await muatDataDariSupabase();

	isiFormProfil();
	tampilkanFotoDanGaleri();
	tampilkanDaftarSkill();
	tampilkanDaftarLink();
	perbaruiAvatarDanSapaan();
}

/* Memuat data profil & skill live dari Supabase untuk pengguna aktif */
async function muatDataDariSupabase() {
	if (!window.supabase || !idPenggunaAktif) return;

	try {
		// 1. Ambil data profil
		const { data: profil, error: errProfil } = await window.supabase
			.from('profiles')
			.select('*')
			.eq('id', idPenggunaAktif)
			.maybeSingle();

		if (errProfil) {
			console.error('Error load profile Supabase:', errProfil.message);
		} else if (profil) {
			dataSaya.nama = profil.name || dataSaya.nama || '';
			dataSaya.kampus = profil.kampus || '';
			dataSaya.jurusan = profil.jurusan || '';
			dataSaya.kategori = profil.kategori_utama || 'Desain Grafis';
			dataSaya.bio = profil.bio || '';
			dataSaya.whatsapp = profil.whatsapp || '';
			dataSaya.status = typeof profil.status === 'number' ? profil.status : 0;
			dataSaya.bukaTukarSkill = profil.terbuka_tukar_skill !== false;
			dataSaya.foto = profil.foto_url || null;
		}

		// 2. Ambil data skill
		const { data: skills, error: errSkills } = await window.supabase
			.from('skills')
			.select('id, nama_skill, tarif')
			.eq('profile_id', idPenggunaAktif);

		if (errSkills) {
			console.error('Error load skills Supabase:', errSkills.message);
		} else if (skills && skills.length > 0) {
			dataSaya.skill = skills.map((s) => ({
				id: s.id,
				nama: s.nama_skill,
				tarif: Number(s.tarif) || 0
			}));
		} else {
			dataSaya.skill = [{ nama: '', tarif: 0 }];
		}

		simpan();
	} catch (err) {
		console.error('Gagal sinkronisasi data dari Supabase:', err);
	}
}

/* ---------- Profil: kolom teks, status, saklar tukar skill ---------- */
function isiFormProfil() {
	const kolomTeks = [
		['f-nama', 'nama'], ['f-kampus', 'kampus'], ['f-jurusan', 'jurusan'],
		['f-kategori', 'kategori'], ['f-whatsapp', 'whatsapp'], ['f-bio', 'bio'],
	];
	kolomTeks.forEach(([id, namaData]) => {
		const kolom = $('#' + id);
		kolom.value = dataSaya[namaData] || '';
		kolom.addEventListener('input', () => {
			dataSaya[namaData] = kolom.value;
			simpan();
			if (namaData === 'nama') perbaruiAvatarDanSapaan();
		});
	});

	$('#f-status').value = dataSaya.status;
	$('#f-status').addEventListener('change', (e) => { dataSaya.status = Number(e.target.value); simpan(); });

	$('#f-buka-tukar').checked = dataSaya.bukaTukarSkill;
	$('#f-buka-tukar').addEventListener('change', (e) => { dataSaya.bukaTukarSkill = e.target.checked; simpan(); });
}

function perbaruiAvatarDanSapaan() {
	$('#sapaan').textContent = 'Halo, ' + (dataSaya.nama || 'Kawan') + '. Atur profil yang dilihat orang di katalog.';
	const avatar = $('#avatar-saya');
	if (dataSaya.foto && typeof dataSaya.foto === 'string' && dataSaya.foto.trim() !== '') {
		avatar.style.backgroundImage = 'url(' + dataSaya.foto + ')';
		avatar.style.backgroundPosition = 'center';
		avatar.style.backgroundSize = 'cover';
		avatar.textContent = '';
	} else {
		avatar.style.backgroundImage = '';
		avatar.textContent = inisial(dataSaya.nama || 'K');
	}
}

/* ---------- Foto profil (Supabase Storage bucket 'avatars') dan portofolio ---------- */
let tujuanGambar = null;

function pilihGambar(tujuan) {
	tujuanGambar = tujuan;
	const input = $('#input-gambar');
	input.value = '';
	input.click();
}

$('#btn-foto').addEventListener('click', () => pilihGambar('foto'));

$('#input-gambar').addEventListener('change', async (e) => {
	const berkas = e.target.files[0];
	if (!berkas) return;
	if (berkas.size > 2e6) { tampilkanToast('Ukuran gambar maksimal 2 MB'); return; }

	// 1. Jika pengguna memilih foto profil
	if (tujuanGambar === 'foto') {
		const btnFoto = $('#btn-foto');
		const teksAsli = btnFoto.textContent;
		btnFoto.disabled = true;
		btnFoto.textContent = 'Mengunggah...';

		if (window.supabase && idPenggunaAktif) {
			try {
				const ekstensi = berkas.name.split('.').pop() || 'jpg';
				const namaFile = `${idPenggunaAktif}/${Date.now()}.${ekstensi}`;

				// a. Unggah berkas ke Supabase Storage bucket 'avatars'
				const { data: uploadData, error: uploadError } = await window.supabase.storage
					.from('avatars')
					.upload(namaFile, berkas, {
						cacheControl: '3600',
						upsert: true
					});

				if (uploadError) throw uploadError;

				// b. Dapatkan URL publik dari berkas tersebut
				const { data: publicUrlData } = window.supabase.storage
					.from('avatars')
					.getPublicUrl(namaFile);

				const urlFoto = publicUrlData.publicUrl;

				// c. Simpan string URL tersebut ke kolom foto_url di tabel profiles
				const { error: updateError } = await window.supabase
					.from('profiles')
					.update({ foto_url: urlFoto })
					.eq('id', idPenggunaAktif);

				if (updateError) throw updateError;

				dataSaya.foto = urlFoto;
				simpan();
				tampilkanFotoDanGaleri();
				tampilkanToast('Foto profil berhasil diunggah!');
			} catch (err) {
				console.error('Gagal mengunggah foto profil ke Supabase Storage:', err);
				tampilkanToast('Gagal unggah foto: ' + (err.message || 'Pastikan bucket avatars bersifat public.'));
			} finally {
				btnFoto.disabled = false;
				btnFoto.textContent = dataSaya.foto ? 'Ganti foto' : 'Unggah foto';
			}
		} else {
			// Fallback preview jika belum terhubung supabase
			const pembaca = new FileReader();
			pembaca.onload = () => {
				dataSaya.foto = pembaca.result;
				simpan();
				tampilkanFotoDanGaleri();
				btnFoto.disabled = false;
				btnFoto.textContent = 'Ganti foto';
			};
			pembaca.readAsDataURL(berkas);
		}
		return;
	}

	// 2. Jika tujuan portofolio galeri (slot 0, 1, 2)
	const pembaca = new FileReader();
	pembaca.onload = () => {
		dataSaya.portofolio[tujuanGambar] = pembaca.result;
		simpan();
		tampilkanFotoDanGaleri();
	};
	pembaca.readAsDataURL(berkas);
});

$('#galeri').addEventListener('click', (e) => {
	const tombol = e.target.closest('[data-aksi]');
	if (!tombol) return;
	const slot = Number(tombol.dataset.slot);
	if (tombol.dataset.aksi === 'tambah') pilihGambar(slot);
	if (tombol.dataset.aksi === 'hapus') {
		dataSaya.portofolio[slot] = null;
		simpan();
		tampilkanFotoDanGaleri();
	}
});

function tampilkanFotoDanGaleri() {
	const avatar = $('#avatar-saya');
	if (dataSaya.foto) {
		avatar.style.backgroundImage = 'url(' + dataSaya.foto + ')';
		avatar.style.backgroundPosition = 'center';
		avatar.style.backgroundSize = 'cover';
		avatar.textContent = '';
	} else {
		avatar.style.backgroundImage = '';
		avatar.textContent = inisial(dataSaya.nama || 'K');
	}
	$('#btn-foto').textContent = dataSaya.foto ? 'Ganti foto' : 'Unggah foto';

	dataSaya.portofolio.forEach((gambar, slot) => {
		const tombolTambah = $('[data-slot="' + slot + '"][data-aksi="tambah"]');
		const kotakGambar = $('[data-slot="' + slot + '"][data-aksi="isi"]');
		tombolTambah.hidden = !!gambar;
		kotakGambar.hidden = !gambar;
		if (gambar) $('img', kotakGambar).src = gambar;
	});
}

/* ---------- Skill dan tarif ---------- */
function tampilkanDaftarSkill() {
	const wadah = $('#daftar-skill');
	wadah.innerHTML = '';
	dataSaya.skill.forEach((skill, urutan) => {
		const baris = $('#tpl-baris-skill').content.cloneNode(true);
		const kolomNama = $('[data-kolom="nama"]', baris);
		const kolomTarif = $('[data-kolom="tarif"]', baris);
		kolomNama.value = skill.nama || '';
		kolomTarif.value = skill.tarif || '';

		kolomNama.addEventListener('input', () => { skill.nama = kolomNama.value; simpan(); });
		kolomTarif.addEventListener('input', () => { skill.tarif = Number(kolomTarif.value) || 0; simpan(); });
		$('[data-aksi="hapus"]', baris).addEventListener('click', () => {
			dataSaya.skill.splice(urutan, 1);
			if (dataSaya.skill.length === 0) dataSaya.skill.push({ nama: '', tarif: 0 });
			simpan();
			tampilkanDaftarSkill();
		});
		wadah.appendChild(baris);
	});
}
$('#btn-tambah-skill').addEventListener('click', () => {
	dataSaya.skill.push({ nama: '', tarif: 0 });
	simpan();
	tampilkanDaftarSkill();
});

/* ---------- Link ulasan ---------- */
$('#btn-buat-link').addEventListener('click', async () => {
	const tokenAcak = Math.random().toString(36).slice(2, 12);
	const jenis = $('#jenis-link').value;

	if (window.supabase && idPenggunaAktif) {
		try {
			await window.supabase
				.from('reviews')
				.insert({
					profile_id: idPenggunaAktif,
					nama_pengulas: 'Tamu (' + jenis + ')',
					rating: 5,
					komentar: 'Menunggu ulasan...',
					token_ulasan: tokenAcak,
					is_used: false,
					tipe_pengulas: jenis === 'tukar-skill' ? 'Pengguna Terdaftar' : 'Pengguna Eksternal'
				});
		} catch (err) {
			console.error('Gagal simpan token ulasan ke Supabase:', err);
		}
	}

	dataSaya.linkUlasan.unshift({
		kode: tokenAcak,
		jenis: jenis,
		terpakai: false,
	});
	simpan();
	tampilkanDaftarLink();
	tampilkanToast('Link ulasan dibuat');
});

function salinLink(url) {
	const hasil = navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject();
	hasil.then(() => tampilkanToast('Link disalin'), () => tampilkanToast('Salin manual dari teks link'));
}

function tampilkanDaftarLink() {
	const wadah = $('#daftar-link');
	wadah.innerHTML = '';
	$('#link-kosong').hidden = dataSaya.linkUlasan.length > 0;

	dataSaya.linkUlasan.forEach((link) => {
		const baris = $('#tpl-link').content.cloneNode(true);
		const url = window.location.origin + window.location.pathname.replace('profil-saya.html', 'ulasan.html') + '?token=' + link.kode;
		isiTeks(baris, 'url', url);
		isiTeks(baris, 'jenis', link.jenis === 'tukar-skill' ? 'Untuk Tukar Skill (pengulas wajib login)' : 'Untuk Minta Tolong');
		const status = isiTeks(baris, 'status', link.terpakai ? 'Sudah dipakai' : 'Belum dipakai');
		const tombolBuka = $('[data-isi="buka"]', baris);
		const tombolSalin = $('[data-isi="salin"]', baris);

		if (link.terpakai) {
			status.classList.add('terpakai');
			tombolBuka.hidden = true;
			tombolSalin.hidden = true;
		} else {
			tombolBuka.href = 'ulasan.html?token=' + link.kode;
			tombolSalin.addEventListener('click', () => salinLink(url));
		}
		wadah.appendChild(baris);
	});
}

/* ---------- Tombol Simpan Perubahan ke Supabase ---------- */
$('#btn-simpan').addEventListener('click', async () => {
	const btn = $('#btn-simpan');
	const teksAsli = btn.textContent;
	btn.disabled = true;
	btn.textContent = 'Menyimpan...';

	simpan();

	if (window.supabase && idPenggunaAktif) {
		try {
			// 1. Simpan tabel profiles
			const { error: errProfil } = await window.supabase
				.from('profiles')
				.upsert({
					id: idPenggunaAktif,
					name: dataSaya.nama || '',
					kampus: dataSaya.kampus || '',
					jurusan: dataSaya.jurusan || '',
					kategori_utama: dataSaya.kategori || 'Desain Grafis',
					bio: dataSaya.bio || '',
					whatsapp: dataSaya.whatsapp || '',
					status: dataSaya.status,
					terbuka_tukar_skill: dataSaya.bukaTukarSkill,
					foto_url: (typeof dataSaya.foto === 'string' && dataSaya.foto.startsWith('http')) ? dataSaya.foto : null
				});

			if (errProfil) throw errProfil;

			// 2. Simpan tabel skills
			await window.supabase
				.from('skills')
				.delete()
				.eq('profile_id', idPenggunaAktif);

			const skillsValid = dataSaya.skill
				.filter((s) => s.nama && s.nama.trim() !== '')
				.map((s) => ({
					profile_id: idPenggunaAktif,
					nama_skill: s.nama.trim(),
					tarif: Number(s.tarif) || 0
				}));

			if (skillsValid.length > 0) {
				const { error: errSkills } = await window.supabase
					.from('skills')
					.insert(skillsValid);

				if (errSkills) throw errSkills;
			}

			tampilkanToast('Perubahan profil berhasil disimpan!');
		} catch (err) {
			console.error('Gagal menyimpan ke Supabase:', err);
			tampilkanToast('Gagal menyimpan: ' + (err.message || 'Periksa koneksi Supabase.'));
		} finally {
			btn.disabled = false;
			btn.textContent = teksAsli;
		}
	} else {
		btn.disabled = false;
		btn.textContent = teksAsli;
		tampilkanToast('Kredensial Supabase belum terhubung.');
	}
});

// Jalankan saat halaman dibuka
siapkanHalaman();

window.addEventListener('supabase:ready', () => {
	siapkanHalaman();
});
