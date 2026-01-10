document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role');
  const adminPanel = document.getElementById('adminPanel');

  if (role === 'admin') {
    adminPanel.style.display = 'flex';
  }
});

window.addEventListener('scroll', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const adminBtns = document.querySelectorAll('.admin-btn');

  if (window.scrollY > 50) {
    menuBtn.classList.add('scrolled');
    adminBtns.forEach(btn => btn.classList.add('scrolled'));
  } else {
    menuBtn.classList.remove('scrolled');
    adminBtns.forEach(btn => btn.classList.remove('scrolled'));
  }
});
