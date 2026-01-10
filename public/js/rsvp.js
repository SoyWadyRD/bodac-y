const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');

const errorNombre = document.getElementById('errorNombre');
const errorApellido = document.getElementById('errorApellido');
const errorAsistencia = document.getElementById('errorAsistencia');

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

// VALIDACIÓN EN VIVO
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

// SUBMIT
document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  const asistenciaInput = document.querySelector('input[name="asistencia"]:checked');

  let valido = true;

  // Re-validar al enviar
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

  // GUARDAR EN BD
  await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, apellido, asistencia })
  });

  // WHATSAPP
  const mensaje = `Hola, soy ${nombre} ${apellido} y ${asistencia === 'Sí' ? 'sí' : 'no'} asistiré a la boda`;
  const telefono = '18296442008';
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');

  // UI
  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpSuccess').style.display = 'block';
});
