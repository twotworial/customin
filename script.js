document.addEventListener('DOMContentLoaded', function() {

    // --- Inisialisasi Elemen DOM ---
    const stickyNav = document.getElementById('sticky-nav');
    const navPlaceholder = document.getElementById('nav-placeholder');
    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // =================================================================
    // LOGIKA NAVIGASI STICKY
    // =================================================================
    
    // Pastikan elemen ada sebelum menambahkan observer
    if (navPlaceholder) {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                // Jika placeholder TIDAK terlihat, tampilkan nav sticky
                if (!entry.isIntersecting) {
                    stickyNav.classList.add('show');
                } else {
                    stickyNav.classList.remove('show');
                }
            },
            { 
                root: null, // viewport
                threshold: 0 // Memicu saat elemen mulai keluar dari pandangan
            }
        );
        // Mulai amati placeholder
        observer.observe(navPlaceholder);
    }


    // =================================================================
    // LOGIKA MENU POP-UP
    // =================================================================

    // Definisikan item menu dalam array agar mudah dikelola
    const menuItems = [
        { label: 'Blog', icon: 'mdi:post-text-outline', url: 'https://blog.customin.co' },
        { label: 'Produk', icon: 'mdi:view-dashboard-outline', url: '/produk' },
        { label: 'Promo', icon: 'mdi:ticket-percent-outline', url: '/promo' },
        { label: 'About', icon: 'mdi:information-outline', url: 'about.html' }
    ];

    // Buat elemen HTML untuk menu secara dinamis
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
    const togglePopupMenu = (event) => {
        event.stopPropagation(); // Mencegah klik menyebar ke window
        popupMenu.classList.toggle('show');
    };

    // Tambahkan event listener ke tombol menu jika ada
    if (menuButton) {
        menuButton.addEventListener('click', togglePopupMenu);
    }

    // Tambahkan event listener untuk menutup menu saat klik di luar
    window.addEventListener('click', () => {
        if (popupMenu.classList.contains('show')) {
            popupMenu.classList.remove('show');
        }
    });

});
