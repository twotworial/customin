window.addEventListener('load', function() {

    // =================================================================
    // INISIALISASI SLIDER (BARU)
    // =================================================================
    const swiper = new Swiper(".main-slider", {
        // Opsi untuk membuat slider berputar terus menerus
        loop: true,
        
        // Opsi untuk slider berjalan otomatis
        autoplay: {
          delay: 3000, // Jeda 3 detik antar slide
          disableOnInteraction: false, // Lanjut jalan walau di-swipe manual
        },
        
        // Menambahkan navigasi titik-titik (pagination)
        pagination: {
          el: ".swiper-pagination",
          clickable: true, // Titik bisa di-klik
        },
    });


    // =================================================================
    // LOGIKA MENU POP-UP (TETAP SAMA)
    // =================================================================
    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    if (!menuButton || !popupMenu) {
        console.error("Tombol menu atau container pop-up tidak ditemukan.");
        return;
    }

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

    function togglePopupMenu(event) {
        event.stopPropagation();
        popupMenu.classList.toggle('show');
    }

    menuButton.addEventListener('click', togglePopupMenu);

    window.addEventListener('click', function() {
        if (popupMenu.classList.contains('show')) {
            popupMenu.classList.remove('show');
        }
    });

});
