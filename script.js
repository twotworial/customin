window.addEventListener('load', function() {

    // --- Inisialisasi Elemen DOM ---
    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // Hentikan script jika elemen penting tidak ditemukan
    if (!menuButton || !popupMenu) {
        console.error("Tombol menu atau container pop-up tidak ditemukan.");
        return;
    }

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
