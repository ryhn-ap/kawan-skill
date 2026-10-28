/* HALAMAN MASUK (masuk.html): Login dengan Supabase Auth */

// Cek konfirmasi email dari redirect Supabase (?confirmed=true atau hash token)
function periksaKonfirmasiEmail() {
	const params = new URLSearchParams(window.location.search);
	const isConfirmedParam = params.get('confirmed') === 'true';
	const hasAccessTokenHash = window.location.hash.includes('access_token');
	const isTypeSignupHash = window.location.hash.includes('type=signup');

	if (isConfirmedParam || hasAccessTokenHash || isTypeSignupHash) {
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

const formMasuk = $('#form-masuk');
const btnSubmit = $('button[type="submit"]', formMasuk);

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
