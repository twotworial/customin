document.addEventListener('DOMContentLoaded', function() {
    const stickyNav = document.getElementById('sticky-nav');
    const navPlaceholder = document.getElementById('nav-placeholder');
    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // --- LOGIKA UNTUK MEMUNCULKAN NAVIGASI STICKY SAAT SCROLL ---
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                // Jika placeholder TIDAK terlihat di layar
                if (!entry.isIntersecting) {
                    stickyNav.classList.add('show');
                } else {
                    stickyNav.classList.remove('show');
                }
            });
        },
        { rootMargin: '0px' } 
    );

    // Mulai amati elemen placeholder
    if (navPlaceholder) {
        observer.observe(navPlaceholder);
    }

    // --- LOGIKA UNTUK MENU POP-UP ---
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

    // Event listener untuk tombol menu di navigasi sticky
    if (menuButton) {
        menuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            popupMenu.classList.toggle('show');
        });
    }

    // Sembunyikan menu saat mengklik di luar
    window.addEventListener('click', function(event) {
        if (popupMenu.classList.contains('show')) {
            if (!popupMenu.contains(event.target) && !menuButton.contains(event.target)) {
                popupMenu.classList.remove('show');
            }
        }
    });
});
