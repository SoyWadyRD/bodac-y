const openMenu = document.getElementById('openMenu');
const closeMenu = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('menuOverlay');
const menuLinks = document.querySelectorAll('.side-menu-links a');

function openSideMenu() {
  sideMenu.classList.add('active');
  overlay.classList.add('active');
}

function closeSideMenu() {
  sideMenu.classList.remove('active');
  overlay.classList.remove('active');
}

// Abrir
openMenu.addEventListener('click', openSideMenu);

// Cerrar con X
closeMenu.addEventListener('click', closeSideMenu);

// Cerrar click afuera
overlay.addEventListener('click', closeSideMenu);

// 🔥 Cerrar al hacer click en un link
menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeSideMenu();
  });
});


window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    openMenu.classList.add('scrolled');
  } else {
    openMenu.classList.remove('scrolled');
  }
});
