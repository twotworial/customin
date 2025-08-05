document.addEventListener('DOMContentLoaded', function() {

    const menuButton = document.getElementById('menuButton');
    const popupMenu = document.getElementById('popupMenu');

    // Daftar menu yang ingin ditampilkan
    const menuItems = [
        { icon: 'ph:read-cv-logo-duotone', text: 'Blog', href: 'https://blog.customin.co' },
        { icon: 'ph:rocket-launch-duotone', text: 'Produk', href: '#produk' },
        { icon: 'ph:confetti-duotone', text: 'Promo', href: '#promo' },
        { icon: 'ph:address-book-duotone', text: 'About', href: 'about.html' },
        { icon: 'ph:chats-teardrop-duotone', text: 'Kontak', href: 'kontak.html' }
    ];

    // Fungsi untuk membuat dan mengisi menu
    function createMenu() {
        // Kosongkan menu sebelumnya untuk menghindari duplikasi
        popupMenu.innerHTML = ''; 

        menuItems.forEach(item => {
            // Buat elemen <li>
            const listItem = document.createElement('li');
            listItem.classList.add('popup-item');

            // Buat elemen <a> (link)
            const link = document.createElement('a');
            link.href = item.href;

            // Buat elemen <span> untuk ikon
            const icon = document.createElement('span');
            icon.classList.add('iconify');
            icon.setAttribute('data-icon', item.icon);

            // Buat elemen <div> untuk teks
            const textContent = document.createElement('div');
            textContent.classList.add('text-content');
            textContent.textContent = item.text;

            // Masukkan ikon dan teks ke dalam link
            link.appendChild(icon);
            link.appendChild(textContent);

            // Masukkan link ke dalam list item
            listItem.appendChild(link);

            // Masukkan list item ke dalam menu utama
            popupMenu.appendChild(listItem);
        });
    }

    // Pastikan elemennya ada sebelum menambahkan event listener
    if (menuButton && popupMenu) {
        // Buat menu saat halaman dimuat
        createMenu();

        // Tampilkan/sembunyikan menu saat tombol di klik
        menuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            popupMenu.classList.toggle('active');
        });

        // Sembunyikan menu jika pengguna mengklik di luar area menu
        document.addEventListener('click', (event) => {
            if (popupMenu.classList.contains('active') && !menuButton.contains(event.target) && !popupMenu.contains(event.target)) {
                popupMenu.classList.remove('active');
            }
        });
    }

});
