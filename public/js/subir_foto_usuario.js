const galleryUploadBtn = document.getElementById('galleryUploadBtn');
const galleryPhotoInput = document.getElementById('galleryPhotoInput');
const uploadMessage = document.getElementById('uploadMessage');

const userRole = localStorage.getItem('role'); // evita conflicto con otras variables

galleryUploadBtn.addEventListener('click', () => galleryPhotoInput.click());

galleryPhotoInput.addEventListener('change', async () => {
  const file = galleryPhotoInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('role', userRole); // enviamos rol al backend

  try {
    const res = await fetch('/api/gallery/upload', { 
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      if (userRole === 'admin') {
        uploadMessage.textContent = 'Foto subida directamente a la galería.';
      } else {
        uploadMessage.textContent = 'Tu foto será revisada por un administrador.';
      }
      uploadMessage.style.color = 'green';
      uploadMessage.style.display = 'block';
      galleryPhotoInput.value = '';
    } else {
      uploadMessage.textContent = 'Error al subir la foto.';
      uploadMessage.style.color = 'red';
      uploadMessage.style.display = 'block';
      console.error(data.error);
    }
  } catch (err) {
    console.error(err);
    uploadMessage.textContent = 'Error al subir la foto.';
    uploadMessage.style.color = 'red';
    uploadMessage.style.display = 'block';
  }
});
