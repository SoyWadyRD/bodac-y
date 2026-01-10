// Evita que el navegador restaure la posición
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Forzar arriba lo antes posible
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, 0);
  }
});
