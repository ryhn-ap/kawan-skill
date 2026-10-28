// NAVBAR: mengatur tombol Masuk/Daftar atau Profil/Keluar sesuai status login & menu mobile
function aturNavbar() {
    const navTamu = $('#nav-tamu');
    const navUser = $('#nav-user');
    const btnKeluar = $('#btn-keluar');

    const mobileNavTamu = $('#mobile-nav-tamu');
    const mobileNavUser = $('#mobile-nav-user');
    const mobileBtnKeluar = $('#mobile-btn-keluar');

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

    if (mobileNavTamu) mobileNavTamu.hidden = sudahLogin;
    if (mobileNavUser) {
        mobileNavUser.hidden = !sudahLogin;

        const mobileLinkProfil = $('a[href^="profil-saya.html"]', mobileNavUser);
        if (mobileLinkProfil) {
            const path = window.location.pathname;
            if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
                mobileLinkProfil.href = 'profil-saya.html?from=beranda';
            } else if (path.endsWith('katalog.html')) {
                mobileLinkProfil.href = 'profil-saya.html?from=katalog';
            }
        }
    }

    if (btnKeluar) {
        btnKeluar.onclick = keluar;
    }
    if (mobileBtnKeluar) {
        mobileBtnKeluar.onclick = keluar;
    }

    // Inisialisasi Hamburger Menu Mobile
    inisialisasiMenuMobile();

    const pesanBerikutnya = ambilPesanBerikutnya(); // misalnya "Berhasil masuk"
    if (pesanBerikutnya) tampilkanToast(pesanBerikutnya);
}

function inisialisasiMenuMobile() {
    const btnHamburger = $('#btn-hamburger');
    const menuMobile = $('#menu-mobile');
    if (!btnHamburger || !menuMobile) return;

    const iconHamburger = $('.icon-hamburger', btnHamburger);
    const iconClose = $('.icon-close', btnHamburger);

    function bukaMenu(buka) {
        menuMobile.hidden = !buka;
        btnHamburger.setAttribute('aria-expanded', String(buka));
        if (iconHamburger) iconHamburger.style.display = buka ? 'none' : 'block';
        if (iconClose) iconClose.style.display = buka ? 'block' : 'none';
    }

    btnHamburger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = !menuMobile.hidden;
        bukaMenu(!isOpen);
    };

    // Tutup menu saat klik tautan di dalam menu mobile
    $$('a', menuMobile).forEach((link) => {
        link.addEventListener('click', () => {
            bukaMenu(false);
        });
    });

    // Tutup menu saat klik di luar area menu
    document.addEventListener('click', (e) => {
        if (!menuMobile.hidden && !menuMobile.contains(e.target) && !btnHamburger.contains(e.target)) {
            bukaMenu(false);
        }
    });

    // Tutup menu saat tombol Escape ditekan
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menuMobile.hidden) {
            bukaMenu(false);
        }
    });
}

aturNavbar();