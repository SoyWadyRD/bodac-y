const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');

const errorNombre = document.getElementById('errorNombre');
const errorApellido = document.getElementById('errorApellido');
const errorAsistencia = document.getElementById('errorAsistencia');

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

// ===============================
// VALIDACIÓN EN VIVO
// ===============================
nombreInput.addEventListener('input', () => {
  const valor = nombreInput.value.trim();

  if (valor.length < 2) {
    errorNombre.textContent = 'El nombre debe tener al menos 2 letras';
  } else if (!soloLetras.test(valor)) {
    errorNombre.textContent = 'Solo se permiten letras';
  } else {
    errorNombre.textContent = '';
  }
});

apellidoInput.addEventListener('input', () => {
  const valor = apellidoInput.value.trim();

  if (valor.length < 2) {
    errorApellido.textContent = 'El apellido debe tener al menos 2 letras';
  } else if (!soloLetras.test(valor)) {
    errorApellido.textContent = 'Solo se permiten letras';
  } else {
    errorApellido.textContent = '';
  }
});

// ===============================
// SUBMIT
// ===============================
document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  const asistenciaInput = document.querySelector('input[name="asistencia"]:checked');

  let valido = true;

  // Re-validar
  if (nombre.length < 2 || !soloLetras.test(nombre)) {
    errorNombre.textContent = 'Ingresa un nombre válido';
    valido = false;
  }

  if (apellido.length < 2 || !soloLetras.test(apellido)) {
    errorApellido.textContent = 'Ingresa un apellido válido';
    valido = false;
  }

  if (!asistenciaInput) {
    errorAsistencia.textContent = 'Por favor selecciona una opción';
    valido = false;
  } else {
    errorAsistencia.textContent = '';
  }

  if (!valido) return;

  const asistencia = asistenciaInput.value;

  // ===============================
  // GUARDAR EN BD
  // ===============================
  try {
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, asistencia })
    });
  } catch (err) {
    console.error('Error guardando asistencia:', err);
  }

  // ===============================
  // MENSAJE WHATSAPP
  // ===============================
  const mensaje = `Hola, soy ${nombre} ${apellido} y ${asistencia === 'Sí' ? 'sí' : 'no'} asistiré a la boda`;
  const telefono = '18296442008';
  const whatsappURL = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

let redireccionado = false;


if (asistencia === 'Sí') {
  const overlay = document.getElementById('videoOverlay');
  const video = document.getElementById('invitacionVideo');

  overlay.style.display = 'flex';
  video.currentTime = 0;
  video.play();

  let lastTime = 0;

  // Evitar pausa SOLO mientras no termine
  const evitarPausa = () => {
    if (!video.ended) {
      video.play();
    }
  };

  video.addEventListener('pause', evitarPausa);

  // Evitar adelantar
  video.addEventListener('timeupdate', () => {
    if (video.currentTime < lastTime) {
      video.currentTime = lastTime;
    }
    lastTime = video.currentTime;
  });

  // Bloquear teclado
  const bloquear = (e) => e.preventDefault();
  document.addEventListener('keydown', bloquear);
  document.addEventListener('contextmenu', bloquear);

  // 🔥 SOLO UNA VEZ
  video.onended = () => {
    if (redireccionado) return;
    redireccionado = true;

    // limpiar todo
    video.removeEventListener('pause', evitarPausa);
    document.removeEventListener('keydown', bloquear);
    document.removeEventListener('contextmenu', bloquear);

    overlay.style.display = 'none';

    // redirigir
    window.location.href = whatsappURL;
  };

} else {
  window.location.href = whatsappURL;
}



  // ===============================
  // UI FINAL
  // ===============================
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpSuccess').style.display = 'block';
});
