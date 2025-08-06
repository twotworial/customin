document.addEventListener('DOMContentLoaded', function() {

    // --- Inisialisasi Elemen ---
    const stickyNav = document.getElementById('sticky-nav');
    const navPlaceholder = document.getElementById('nav-placeholder');
    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // =================================================================
    // LOGIKA NAVIGASI STICKY
    // Menggunakan Intersection Observer untuk efisiensi performa.
    // =================================================================
    const observerCallback = (entries) => {
        // 'entry' adalah navPlaceholder yang kita amati
        const [entry] = entries;
        // Jika placeholder TIDAK terlihat di layar (telah di-scroll)
        if (!entry.isIntersecting) {
            stickyNav.classList.add('show');
        } else {
            stickyNav.classList.remove('show');
        }
    };

    const observer = new IntersectionObserver(observerCallback, {
        root: null, // Menggunakan viewport sebagai area pengamatan
        threshold: 0, // Memicu saat elemen mulai hilang
    });

    // Mulai amati elemen placeholder jika ada
    if (navPlaceholder) {
        observer.observe(navPlaceholder);
    }

    // =================================================================
    // LOGIKA MENU POP-UP
    // Membuat menu secara dinamis dan mengelola visibilitasnya.
    // =================================================================
    const menuItems = [
        { label: 'Blog', icon: 'mdi:post-text-outline', url: 'https://blog.customin.co' },
        { label: 'Produk', icon: 'mdi:view-dashboard-outline', url: '/produk' },
        { label: 'Promo', icon: 'mdi:ticket-percent-outline', url: '/promo' },
        { label: 'About', icon: 'mdi:information-outline', url: 'about.html' }
    ];

    // Membuat elemen daftar menu dari array
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

    // Event listener untuk membuka/menutup menu
    const togglePopupMenu = (event) => {
        event.stopPropagation(); // Mencegah event menyebar ke window
        popupMenu.classList.toggle('show');
    };

    if (menuButton) {
        menuButton.addEventListener('click', togglePopupMenu);
    }

    // Event listener untuk menutup menu saat mengklik di luar
    window.addEventListener('click', () => {
        if (popupMenu.classList.contains('show')) {
            popupMenu.classList.remove('show');
        }
    });

});
