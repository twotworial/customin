// Menunggu seluruh halaman (termasuk gambar) dimuat sebelum menjalankan script.
// Ini untuk memastikan semua posisi elemen sudah final.
window.addEventListener('load', function() {

    // --- Inisialisasi Elemen DOM ---
    const stickyNav = document.getElementById('sticky-nav');
    const navPlaceholder = document.getElementById('nav-placeholder');
    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // Pastikan semua elemen penting ditemukan sebelum melanjutkan
    if (!stickyNav || !navPlaceholder || !menuButton || !popupMenu) {
        console.error("Satu atau lebih elemen penting tidak ditemukan. Pastikan ID di HTML sudah benar.");
        return; // Hentikan eksekusi jika elemen tidak ada
    }

    // =================================================================
    // LOGIKA NAVIGASI STICKY (METODE BARU YANG LEBIH STABIL)
    // =================================================================
    
    function handleScroll() {
        // Dapatkan posisi 'placeholder' relatif terhadap viewport
        const placeholderPosition = navPlaceholder.getBoundingClientRect();

        // Jika bagian atas placeholder sudah melewati bagian bawah layar,
        // artinya placeholder sudah tidak terlihat.
        if (placeholderPosition.top < window.innerHeight) {
            stickyNav.classList.add('show');
        } else {
            stickyNav.classList.remove('show');
        }
    }

    // Tambahkan event listener ke window untuk mendeteksi scroll
    window.addEventListener('scroll', handleScroll);


    // =================================================================
    // LOGIKA MENU POP-UP
    // =================================================================

    const menuItems = [
        { label: 'Blog', icon: 'mdi:post-text-outline', url: 'https://blog.customin.co' },
        { label: 'Produk', icon: 'mdi:view-dashboard-outline', url: '/produk' },
        { label: 'Promo', icon: 'mdi:ticket-percent-outline', url: '/promo' },
        { label: 'About', icon: 'mdi:information-outline', url: 'about.html' }
    ];

    const menuList = document.createElement('ul');
    menuItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="${item.url}">
                <span class="iconify" data-icon="${item.icon}"></span>
                <span>${item.label}</span>
            </a>
        `;
        menuList.appendChild(listItem);
    });
    popupMenu.appendChild(menuList);

    // Fungsi untuk membuka/menutup menu
    function togglePopupMenu(event) {
        event.stopPropagation();
        popupMenu.classList.toggle('show');
    }

    menuButton.addEventListener('click', togglePopupMenu);

    // Fungsi untuk menutup menu saat klik di luar
    window.addEventListener('click', function() {
        if (popupMenu.classList.contains('show')) {
            popupMenu.classList.remove('show');
        }
    });

});
