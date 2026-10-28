/* HALAMAN MASUK (masuk.html): Login dengan Supabase Auth & Reset Kata Sandi */

/* 1. Toggle Lihat/Sembunyikan Kata Sandi */
function inisialisasiToggleSandi() {
	$$('.btn-toggle-pw').forEach((btn) => {
		btn.addEventListener('click', () => {
			const targetId = btn.dataset.target;
			const input = $('#' + targetId);
			if (!input) return;

			const iconEye = $('.icon-eye', btn);
			const iconEyeOff = $('.icon-eye-off', btn);

			if (input.type === 'password') {
				input.type = 'text';
				if (iconEye) iconEye.style.display = 'none';
				if (iconEyeOff) iconEyeOff.style.display = 'block';
				btn.setAttribute('aria-label', 'Sembunyikan kata sandi');
			} else {
				input.type = 'password';
				if (iconEye) iconEye.style.display = 'block';
				if (iconEyeOff) iconEyeOff.style.display = 'none';
				btn.setAttribute('aria-label', 'Lihat kata sandi');
			}
		});
	});
}

inisialisasiToggleSandi();

// Cek konfirmasi email dari redirect Supabase (?confirmed=true atau hash token)
function periksaKonfirmasiEmail() {
	const params = new URLSearchParams(window.location.search);
	const isConfirmedParam = params.get('confirmed') === 'true';
	const hasAccessTokenHash = window.location.hash.includes('access_token');
	const isTypeSignupHash = window.location.hash.includes('type=signup');

	if (isConfirmedParam || (hasAccessTokenHash && isTypeSignupHash)) {
		const toast = $('#toast');
		if (toast) {
			toast.style.borderColor = '#2DB7AD';
			toast.style.color = '#2DB7AD';
		}
		tampilkanToast('Email berhasil diverifikasi! Silakan masuk ke akunmu.', 4500);

		// Bersihkan hash dari URL agar terlihat rapi tanpa reload
		if (window.location.hash) {
			history.replaceState(null, '', window.location.pathname + window.location.search);
		}
	}
}

periksaKonfirmasiEmail();

/* 2. Fitur Lupa & Reset Kata Sandi */
const dlgLupaSandi = $('#dlg-lupa-sandi');
const linkLupaSandi = $('#link-lupa-sandi');
const formLupaSandi = $('#form-lupa-sandi');
const formResetSandiBaru = $('#form-reset-sandi-baru');
const formMasuk = $('#form-masuk');
const btnSubmit = $('button[type="submit"]', formMasuk);

if (linkLupaSandi && dlgLupaSandi) {
	linkLupaSandi.addEventListener('click', (e) => {
		e.preventDefault();
		dlgLupaSandi.showModal();
	});

	// Tutup modal
	$$('[data-tutup]', dlgLupaSandi).forEach((el) => {
		el.addEventListener('click', () => dlgLupaSandi.close());
	});
	dlgLupaSandi.addEventListener('click', (e) => {
		if (e.target === dlgLupaSandi) dlgLupaSandi.close();
	});
}

// Kirim link reset kata sandi via email
if (formLupaSandi) {
	formLupaSandi.addEventListener('submit', async (e) => {
		e.preventDefault();
		const emailReset = $('#lupa-email').value.trim();
		if (!emailReset) return;

		const btnKirim = $('#btn-kirim-reset');
		const teksAsli = btnKirim.textContent;
		btnKirim.disabled = true;
		btnKirim.textContent = 'Mengirim...';

		try {
			if (window.supabase) {
				const redirectTo = `${window.location.origin}/masuk.html?reset=true`;
				const { error } = await window.supabase.auth.resetPasswordForEmail(emailReset, {
					redirectTo: redirectTo
				});
				if (error) throw error;
			}
			if (dlgLupaSandi) dlgLupaSandi.close();
			tampilkanToast('Link reset kata sandi telah dikirim ke email kamu. Silakan periksa inbox/spam.', 5000);
			$('#lupa-email').value = '';
		} catch (err) {
			console.error('Gagal reset password email:', err);
			tampilkanToast(err.message || 'Gagal mengirim link reset kata sandi.');
		} finally {
			btnKirim.disabled = false;
			btnKirim.textContent = teksAsli;
		}
	});
}

// Menampilkan form kata sandi baru
function tampilkanFormKataSandiBaru() {
	if (formMasuk) formMasuk.style.display = 'none';
	const tabs = $('.tabs');
	if (tabs) tabs.style.display = 'none';
	const note = $$('.note');
	note.forEach((n) => n.style.display = 'none');

	if (formResetSandiBaru) formResetSandiBaru.style.display = 'block';
}

function kembalikanKeFormLogin() {
	if (formResetSandiBaru) formResetSandiBaru.style.display = 'none';
	if (formMasuk) formMasuk.style.display = 'block';
	const tabs = $('.tabs');
	if (tabs) tabs.style.display = 'flex';
	const note = $$('.note');
	note.forEach((n) => n.style.display = '');

	// Bersihkan URL dari parameter / hash recovery
	history.replaceState(null, '', window.location.pathname);
}

// Cek apakah halaman dibuka dari link reset password
function periksaModeResetPassword() {
	const params = new URLSearchParams(window.location.search);
	const isResetParam = params.get('reset') === 'true';
	const isRecoveryHash = window.location.hash.includes('type=recovery');

	if (isResetParam || isRecoveryHash) {
		tampilkanFormKataSandiBaru();
	}
}

periksaModeResetPassword();

// Dengarkan event onAuthStateChange untuk PASSWORD_RECOVERY
if (window.supabase) {
	window.supabase.auth.onAuthStateChange(async (event) => {
		if (event === 'PASSWORD_RECOVERY') {
			tampilkanFormKataSandiBaru();
		}
	});
}
window.addEventListener('supabase:ready', () => {
	if (window.supabase) {
		window.supabase.auth.onAuthStateChange(async (event) => {
			if (event === 'PASSWORD_RECOVERY') {
				tampilkanFormKataSandiBaru();
			}
		});
	}
});

// Submit form kata sandi baru
if (formResetSandiBaru) {
	formResetSandiBaru.addEventListener('submit', async (e) => {
		e.preventDefault();
		const sandiBaru = $('#sandi-baru').value;
		if (!sandiBaru || sandiBaru.length < 8) {
			tampilkanToast('Kata sandi minimal 8 karakter.');
			return;
		}

		const btnSimpan = $('button[type="submit"]', formResetSandiBaru);
		const teksAsli = btnSimpan.textContent;
		btnSimpan.disabled = true;
		btnSimpan.textContent = 'Menyimpan...';

		try {
			if (window.supabase) {
				const { error } = await window.supabase.auth.updateUser({
					password: sandiBaru
				});
				if (error) throw error;
			}

			const toast = $('#toast');
			if (toast) {
				toast.style.borderColor = '#2DB7AD';
				toast.style.color = '#2DB7AD';
			}
			tampilkanToast('Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.', 5000);
			$('#sandi-baru').value = '';
			kembalikanKeFormLogin();
		} catch (err) {
			console.error('Gagal update sandi baru:', err);
			tampilkanToast(err.message || 'Gagal memperbarui kata sandi.');
		} finally {
			btnSimpan.disabled = false;
			btnSimpan.textContent = teksAsli;
		}
	});
}

formMasuk.addEventListener('submit', async (e) => {
	e.preventDefault();

	const email = $('#masuk-email').value.trim();
	const sandi = $('#masuk-sandi').value;

	if (!email || !sandi) {
		tampilkanToast('Mohon lengkapi email dan kata sandi.');
		return;
	}

	const teksAsli = btnSubmit.textContent;
	btnSubmit.disabled = true;
	btnSubmit.textContent = 'Memverifikasi...';

	try {
		if (window.supabase) {
			const { data, error } = await window.supabase.auth.signInWithPassword({
				email: email,
				password: sandi,
			});

			if (error) throw error;

			const user = data.user;
			let namaUser = user.user_metadata?.name || '';

			// Ambil nama dari tabel profiles jika ada
			try {
				const { data: profile } = await window.supabase
					.from('profiles')
					.select('name')
					.eq('id', user.id)
					.maybeSingle();

				if (profile && profile.name) {
					namaUser = profile.name;
				}
			} catch (_) { }

			if (!namaUser) {
				namaUser = email.split('@')[0];
			}

			selesaiLogin(namaUser, 'Berhasil masuk', user);
			return;
		}

		// Fallback simulasi jika Supabase URL belum diisi
		const nama = dataSaya.nama || email.split('@')[0];
		selesaiLogin(nama, 'Mode demo: Berhasil masuk');
	} catch (err) {
		console.error('Error saat login:', err);
		tampilkanToast(err.message || 'Email atau kata sandi salah.');
		btnSubmit.disabled = false;
		btnSubmit.textContent = teksAsli;
	}
});
