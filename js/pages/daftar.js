/* HALAMAN DAFTAR (daftar.html): Pendaftaran akun dengan Supabase Auth + pembuatan baris profil */

/* Toggle Lihat/Sembunyikan Kata Sandi */
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

const formDaftar = $('#form-daftar');
const btnSubmit = $('button[type="submit"]', formDaftar);

formDaftar.addEventListener('submit', async (e) => {
	e.preventDefault();

	const nama = $('#daftar-nama').value.trim();
	const email = $('#daftar-email').value.trim();
	const sandi = $('#daftar-sandi').value;

	if (!nama || !email || !sandi) {
		tampilkanToast('Mohon lengkapi semua kolom.');
		return;
	}

	const teksAsli = btnSubmit.textContent;
	btnSubmit.disabled = true;
	btnSubmit.textContent = 'Mendaftarkan...';

	try {
		if (window.supabase) {
			const redirectTo = `${window.location.origin}/masuk.html?confirmed=true`;

			const { data, error } = await window.supabase.auth.signUp({
				email: email,
				password: sandi,
				options: {
					emailRedirectTo: redirectTo,
					data: { name: nama }
				}
			});

			if (error) throw error;

			const user = data.user;
			if (user) {
				// Simpan profil awal di tabel profiles (schema.sql)
				const { error: profileError } = await window.supabase
					.from('profiles')
					.upsert({
						id: user.id,
						name: nama,
						kategori_utama: 'Desain Grafis',
						status: 0,
						terbuka_tukar_skill: true
					});

				if (profileError) {
					console.warn('Catatan: Profil awal gagal dibuat otomatis:', profileError.message);
				}

				// Jika email confirmation aktif di Supabase dan user belum punya session
				if (!data.session) {
					btnSubmit.disabled = false;
					btnSubmit.textContent = teksAsli;
					tampilkanToast('Pendaftaran berhasil! Silakan cek kotak masuk atau folder spam email kamu untuk verifikasi akun sebelum masuk.', 5000);
					setTimeout(() => { location.href = 'masuk.html'; }, 4000);
					return;
				}

				selesaiLogin(nama, 'Akun dibuat. Selamat datang di Kawan Skill!', user);
				return;
			}
		}

		// Fallback simulasi jika Supabase URL belum diisi
		selesaiLogin(nama, 'Mode demo: Akun dibuat. Selamat datang!');
	} catch (err) {
		console.error('Error saat pendaftaran:', err);
		tampilkanToast(err.message || 'Gagal membuat akun. Silakan coba lagi.');
		btnSubmit.disabled = false;
		btnSubmit.textContent = teksAsli;
	}
});
