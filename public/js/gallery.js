const galleryGrid = document.getElementById('galleryGrid');

async function loadApprovedPhotos() {
  try {
    const res = await fetch('/api/gallery/approved');
    const photos = await res.json();

    galleryGrid.innerHTML = '';

    if (!photos.length) {
      galleryGrid.innerHTML = '<p style="text-align:center;"> <br>No hay fotos en la galería.</p>';
      return;
    }

    photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'photo';

      const img = document.createElement('img');
      img.src = photo.url;
      img.dataset.id = photo._id; // <-- Guardamos el ID de la foto

      card.appendChild(img);
      galleryGrid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    galleryGrid.innerHTML = '<p style="text-align:center; color:red;">Error al cargar la galería.</p>';
  }
}

// Inicializar
loadApprovedPhotos();

// --------------------
// Función para enviar foto a la papelera (solo admin)
// --------------------
async function handleSendToTrash(photoId) {
  if (!photoId) return alert('ID de foto no válido');

  try {
    const res = await fetch(`/api/gallery/trash/${photoId}`, {
      method: 'POST',
    });
    const data = await res.json();

    if (data.success) {
      alert('Foto enviada a la papelera');
      loadApprovedPhotos(); // recarga la galería
      closeLightbox();      // cierra el lightbox
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error al enviar la foto a la papelera');
  }
}

// --------------------
// Lightbox
// --------------------
const lightboxOverlay = document.getElementById('lightboxOverlay');
const lightboxImg = document.getElementById('lightboxImg');
const downloadBtn = document.getElementById('downloadLightboxBtn');
const closeBtn = document.getElementById('closeLightboxBtn');
const deleteBtn = document.getElementById('deleteLightboxBtn');

function openLightbox(imgSrc, photoId) {
  lightboxImg.src = imgSrc;
  lightboxOverlay.style.display = 'flex';

  // Configurar descarga
  downloadBtn.onclick = () => {
    fetch(imgSrc)
      .then(resp => resp.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = imgSrc.split('/').pop().split('?')[0];
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Error al descargar la foto:', err));
  };

  // Mostrar u ocultar botón de eliminar según el rol
  if (userRole === 'admin') {
    deleteBtn.style.display = 'flex';
    deleteBtn.onclick = () => handleSendToTrash(photoId);
  } else {
    deleteBtn.style.display = 'none';
  }
}

function closeLightbox() {
  lightboxOverlay.style.display = 'none';
}

// Eventos para cerrar lightbox
closeBtn.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

// Abrir lightbox al hacer click en una foto
galleryGrid.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    const photoId = e.target.dataset.id; // <-- Obtenemos el ID de la foto
    openLightbox(e.target.src, photoId);
  }
});
