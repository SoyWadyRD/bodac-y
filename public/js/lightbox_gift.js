// ELEMENTOS
const regaloImg = document.getElementById('regaloImg');
const regaloLightbox = document.getElementById('regaloLightbox');
const regaloLightboxImg = document.getElementById('regaloLightboxImg');
const closeRegaloLightbox = document.getElementById('closeRegaloLightbox');

// ABRIR LIGHTBOX
regaloImg.addEventListener('click', () => {
  regaloLightbox.style.display = 'flex';
  regaloLightboxImg.src = regaloImg.src;
});

// CERRAR AL HACER CLICK EN X
closeRegaloLightbox.addEventListener('click', () => {
  regaloLightbox.style.display = 'none';
});

// CERRAR AL HACER CLICK FUERA DE LA IMAGEN
regaloLightbox.addEventListener('click', (e) => {
  if(e.target === regaloLightbox) {
    regaloLightbox.style.display = 'none';
  }
});
