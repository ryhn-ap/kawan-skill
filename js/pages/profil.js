/* PROFIL PENYEDIA PUBLIK (profil.html?id=<UUID>)
   Mengambil data detail penyedia secara live dari database Supabase (profiles, skills, reviews).
   TIDAK MENGGUNAKAN DATA DUMMY SAMA SEKALI. */

function ambilTargetId() {
	const params = new URLSearchParams(window.location.search);
	let id = params.get('id');
	if (!id && window.location.hash) {
		id = window.location.hash.replace('#', '').trim();
	}
	return id;
}

/* Mengatur target dan teks tombol kembali sesuai parameter referer 'from' */
function aturTombolKembali() {
	const fromPage = new URLSearchParams(window.location.search).get('from');
	const tombolKembali = $('.back');
	if (!tombolKembali) return;

	if (fromPage === 'beranda') {
		tombolKembali.href = 'index.html';
		tombolKembali.textContent = '< Kembali ke beranda';
	} else {
		tombolKembali.href = 'katalog.html';
		tombolKembali.textContent = '< Kembali ke katalog';
	}
}

async function inisialisasiProfilPublik() {
	aturTombolKembali();
	const targetId = ambilTargetId();

	if (!targetId) {
		tampilkanErrorProfil('ID penyedia tidak ditemukan di alamat URL.');
		return;
	}

	// Jika Supabase belum siap, dengarkan event supabase:ready
	if (!window.supabase) {
		tampilkanLoadingProfil();
		window.addEventListener('supabase:ready', () => {
			inisialisasiProfilPublik();
		}, { once: true });
		return;
	}

	if (window.isSupabaseConfigured && !window.isSupabaseConfigured()) {
		tampilkanErrorProfil('Kredensial Supabase belum diatur di <code>js/supabase-client.js</code>.');
		return;
	}

	tampilkanLoadingProfil();

	try {
		const { data, error } = await window.supabase
			.from('profiles')
			.select('*, skills(*), reviews(*)')
			.eq('id', targetId)
			.single();

		if (error) {
			console.error('Error saat mengambil profil dari Supabase:', error);
			tampilkanErrorProfil(error.message || 'Penyedia skill tidak ditemukan di database.');
			return;
		}

		if (!data) {
			tampilkanErrorProfil('Penyedia skill tidak ditemukan di database.');
			return;
		}

		// Filter reviews agar hanya menampilkan ulasan yang valid / sudah diisi komentar
		if (Array.isArray(data.reviews)) {
			data.reviews = data.reviews.filter((r) => r.komentar && r.komentar.trim() !== '' && r.status !== 'pending');
		}

		const penyedia = transformProfil(data);

		// Cek apakah user yang login sedang melihat profil miliknya sendiri
		let isProfilSendiri = false;
		try {
			const { data: authData } = await window.supabase.auth.getUser();
			if (authData && authData.user && String(authData.user.id) === String(penyedia.id)) {
				isProfilSendiri = true;
			}
		} catch (e) {
			console.warn('Gagal cek auth user di profil:', e);
		}
		if (!isProfilSendiri && typeof dataSaya !== 'undefined' && dataSaya && dataSaya.id && String(dataSaya.id) === String(penyedia.id)) {
			isProfilSendiri = true;
		}

		renderProfil(penyedia, isProfilSendiri);
	} catch (err) {
		console.error('Koneksi Supabase error:', err);
		tampilkanErrorProfil('Terjadi kesalahan saat menghubungi server.');
	}
}

function tampilkanLoadingProfil() {
	$('#p-nama').textContent = 'Memuat profil...';
	$('#p-kampus').textContent = 'Mohon tunggu';
	$('#p-bio').textContent = 'Sedang memuat data dari database...';
	$('#p-daftar-skill').innerHTML = '<p class="mu" style="padding: 10px 0;">Memuat keahlian...</p>';
	const wadahPorto = $('#p-daftar-portofolio');
	if (wadahPorto) wadahPorto.innerHTML = '<p class="mu" style="padding: 10px 0; grid-column: 1 / -1;">Memuat portofolio...</p>';
	$('#p-daftar-ulasan').innerHTML = '<p class="mu" style="padding: 10px 0;">Memuat ulasan...</p>';
}

function tampilkanErrorProfil(pesan) {
	const fromPage = new URLSearchParams(window.location.search).get('from');
	const hrefKembali = fromPage === 'beranda' ? 'index.html' : 'katalog.html';
	const teksKembali = fromPage === 'beranda' ? '← Kembali ke beranda' : '← Kembali ke katalog';

	const main = $('main .wrap');
	if (main) {
		main.innerHTML = `
			<a class="back" href="${hrefKembali}">${teksKembali}</a>
			<div class="empty" style="padding: 60px 0;">
				<h2 style="font-size: 1.5rem; margin-bottom: 12px; color: var(--org);">Profil Tidak Ditemukan</h2>
				<p class="mu">${pesan}</p>
				<a class="btn tl" href="katalog.html" style="margin-top: 20px;">Jelajahi Katalog</a>
			</div>
		`;
	}
}

function renderProfil(penyedia, isProfilSendiri = false) {
	aturTombolKembali();
	const statusPenyedia = DAFTAR_STATUS[penyedia.status] || DAFTAR_STATUS[0];
	document.title = penyedia.nama + ' | Kawan Skill';

	/* Banner pratinjau profil sendiri */
	const bannerSendiri = $('#banner-profil-sendiri');
	if (bannerSendiri) {
		bannerSendiri.style.display = isProfilSendiri ? 'flex' : 'none';
	}

	/* ---------- Kartu kiri ---------- */
	const avatar = $('#p-avatar');
	avatar.style.setProperty('--c', warnaAvatar(penyedia));

	// Tampilan foto profil jika foto_url ada di database
	if (penyedia.fotoUrl && typeof penyedia.fotoUrl === 'string' && penyedia.fotoUrl.trim() !== '') {
		avatar.style.backgroundImage = 'url(' + penyedia.fotoUrl + ')';
		avatar.style.backgroundPosition = 'center';
		avatar.style.backgroundSize = 'cover';
		avatar.textContent = '';
	} else {
		avatar.style.backgroundImage = '';
		avatar.textContent = inisial(penyedia.nama);
	}

	$('#p-nama').textContent = penyedia.nama;
	$('#p-kampus').textContent = formatKampus(penyedia);
	$('#p-rating').textContent = penyedia.rating || '5.0';
	$('#p-jumlah-ulasan').textContent = penyedia.jumlahUlasan || 0;
	$('#p-titik').className = 'dot ' + statusPenyedia.titik;
	$('#p-status').textContent = statusPenyedia.nama;
	$('#p-badge-tukar').hidden = !penyedia.bukaTukarSkill;

	/* Tombol aksi */
	const tombolMinta = $('#btn-minta-tolong');
	const tombolTukar = $('#btn-tukar-skill');
	const tombolEditSendiri = $('#btn-edit-profil-sendiri');
	const teksWaInfo = $('#p-wa-info');
	const pTukarTutup = $('#p-tukar-tutup');

	if (isProfilSendiri) {
		// Sembunyikan tombol transaksi Minta Tolong & Tukar Skill
		if (tombolMinta) tombolMinta.style.display = 'none';
		if (tombolTukar) tombolTukar.style.display = 'none';
		if (pTukarTutup) pTukarTutup.hidden = true;
		if (teksWaInfo) teksWaInfo.style.display = 'none';

		// Tampilkan tombol "Edit Profil Saya"
		if (tombolEditSendiri) tombolEditSendiri.style.display = 'block';
	} else {
		if (tombolEditSendiri) tombolEditSendiri.style.display = 'none';
		if (teksWaInfo) teksWaInfo.style.display = 'block';

		if (tombolMinta) {
			tombolMinta.style.display = 'block';
			tombolMinta.disabled = !statusPenyedia.bisaMintaTolong;
			tombolMinta.textContent = statusPenyedia.bisaMintaTolong ? 'Minta Tolong' : 'Minta Tolong (belum tersedia)';
		}

		if (tombolTukar) {
			if (penyedia.bukaTukarSkill) {
				tombolTukar.style.display = 'block';
				tombolTukar.disabled = !statusPenyedia.bisaTukarSkill;
				tombolTukar.textContent = statusPenyedia.bisaTukarSkill ? 'Tukar Skill' : 'Tukar Skill (belum tersedia)';
				if (pTukarTutup) pTukarTutup.hidden = true;
			} else {
				tombolTukar.style.display = 'none';
				if (pTukarTutup) pTukarTutup.hidden = false;
			}
		}
	}

	/* ---------- Kolom kanan: Bio ---------- */
	$('#p-bio').textContent = penyedia.bio || 'Belum ada deskripsi profil.';

	/* ---------- Daftar Skill ---------- */
	const wadahSkill = $('#p-daftar-skill');
	wadahSkill.innerHTML = '';
	const daftarSkillBertarif = skillBertarif(penyedia);

	if (daftarSkillBertarif.length === 0) {
		wadahSkill.innerHTML = '<p class="mu" style="padding: 10px 0;">Belum ada daftar skill yang ditambahkan.</p>';
	} else {
		daftarSkillBertarif.forEach((skill) => {
			const baris = $('#tpl-skill').content.cloneNode(true);
			isiTeks(baris, 'nama', skill.nama);
			isiTeks(baris, 'tarif', rupiah(skill.tarif));
			wadahSkill.appendChild(baris);
		});
	}

	/* ---------- Portofolio ---------- */
	const wadahPorto = $('#p-daftar-portofolio');
	if (wadahPorto) {
		wadahPorto.innerHTML = '';
		const daftarPorto = (penyedia.portofolioUrls || []).filter(Boolean);

		if (daftarPorto.length === 0) {
			wadahPorto.innerHTML = '<p class="mu" style="padding: 10px 0; grid-column: 1 / -1;">Kawan ini belum mengunggah portofolio.</p>';
		} else {
			daftarPorto.forEach((urlGambar, index) => {
				const item = document.createElement('div');
				item.style.overflow = 'hidden';
				item.style.padding = '0';
				item.innerHTML = `<img src="${urlGambar}" alt="Portofolio ${index + 1}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`;
				wadahPorto.appendChild(item);
			});
		}
	}

	/* ---------- Daftar Ulasan (Murni dari relasi reviews) ---------- */
	const wadahUlasan = $('#p-daftar-ulasan');
	wadahUlasan.innerHTML = '';

	const listUlasan = penyedia.reviewsRelasi || [];

	if (listUlasan.length === 0) {
		wadahUlasan.innerHTML = '<p class="mu" style="padding: 12px 0;">Belum ada ulasan untuk kawan ini.</p>';
	} else {
		listUlasan.forEach((ulasan) => {
			const baris = $('#tpl-ulasan').content.cloneNode(true);
			isiTeks(baris, 'nama', ulasan.nama_pengulas || 'Anonim');
			isiTeks(baris, 'label', ulasan.tipe_pengulas || 'Pengguna');
			isiTeks(baris, 'isi', ulasan.komentar || '-');
			const skor = isiTeks(baris, 'skor', '★ ' + (ulasan.rating || 5));
			skor.setAttribute('aria-label', 'Skor ' + (ulasan.rating || 5) + ' dari 5');
			wadahUlasan.appendChild(baris);
		});
	}

	/* Hubungkan tombol dengan form WhatsApp */
	if (typeof siapkanFormWhatsapp === 'function') {
		siapkanFormWhatsapp(penyedia);
	}
}

// Inisialisasi awal
inisialisasiProfilPublik();
