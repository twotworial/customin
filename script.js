document.addEventListener('DOMContentLoaded', function() {

    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // Definisikan item-item menu di sini
    const menuItems = [
        { label: 'Blog', icon: 'mdi:post-text-outline', url: 'https://blog.customin.co' },
        { label: 'Produk', icon: 'mdi:view-dashboard-outline', url: '/produk' },
        { label: 'Promo', icon: 'mdi:ticket-percent-outline', url: '/promo' },
        { label: 'About', icon: 'mdi:information-outline', url: 'about.html' }
    ];

    // Buat daftar menu dari array
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

    // Tampilkan/sembunyikan menu saat tombol tengah diklik
    menuButton.addEventListener('click', function(event) {
        event.stopPropagation();
        popupMenu.classList.toggle('show');
    });

    // Sembunyikan menu saat mengklik di luar area menu
    window.addEventListener('click', function(event) {
        if (popupMenu.classList.contains('show')) {
            if (!popupMenu.contains(event.target) && !menuButton.contains(event.target)) {
                popupMenu.classList.remove('show');
            }
        }
    });

});
