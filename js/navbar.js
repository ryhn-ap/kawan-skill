// NAVBAR: mengatur tombol Masuk/Daftar atau Profil/Keluar sesuai status login
function aturNavbar() {
    const navTamu = $('#nav-tamu');
    const navUser = $('#nav-user');
    const btnKeluar = $('#btn-keluar');

    if (navTamu) navTamu.hidden = sudahLogin;
    if (navUser) {
        navUser.hidden = !sudahLogin;

        // Atur link profil dengan parameter ?from= sesuai halaman saat ini
        const linkProfil = $('a[href^="profil-saya.html"]', navUser);
        if (linkProfil) {
            const path = window.location.pathname;
            if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
                linkProfil.href = 'profil-saya.html?from=beranda';
            } else if (path.endsWith('katalog.html')) {
                linkProfil.href = 'profil-saya.html?from=katalog';
            }
        }
    }
    if (btnKeluar) btnKeluar.addEventListener('click', keluar);

    const pesanBerikutnya = ambilPesanBerikutnya(); // misalnya "Berhasil masuk"
    if (pesanBerikutnya) tampilkanToast(pesanBerikutnya);
}
aturNavbar();