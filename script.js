// script.js

// JavaScript untuk fungsionalitas menu pop-up
const menuButton = document.getElementById('menuButton');
const popupMenu = document.getElementById('popupMenu');

// Pastikan elemennya ada sebelum menambahkan event listener
if (menuButton && popupMenu) {
    // Tampilkan/sembunyikan menu saat tombol di klik
    menuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Mencegah event "klik" menyebar ke window
        popupMenu.classList.toggle('active');
    });

    // Sembunyikan menu jika pengguna mengklik di luar area menu
    document.addEventListener('click', (event) => {
        // Cek apakah menu sedang aktif dan klik terjadi di luar menu dan tombolnya
        if (popupMenu.classList.contains('active') && !menuButton.contains(event.target) && !popupMenu.contains(event.target)) {
            popupMenu.classList.remove('active');
        }
    });
}
