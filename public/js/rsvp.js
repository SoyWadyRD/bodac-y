const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');

const errorNombre = document.getElementById('errorNombre');
const errorApellido = document.getElementById('errorApellido');
const errorAsistencia = document.getElementById('errorAsistencia');

const acompanantesGroup = document.getElementById('acompanantesGroup');
const personasContainer = document.getElementById('personasContainer');
const addPersonaBtn = document.getElementById('addPersonaBtn');
const capacidadMsg = document.getElementById('capacidadMsg');

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
let personas = [];

// ===============================
// VALIDACIÓN EN VIVO
// ===============================
nombreInput.addEventListener('input', () => validarTexto(nombreInput, errorNombre));
apellidoInput.addEventListener('input', () => validarTexto(apellidoInput, errorApellido));

function validarTexto(input, errorEl) {
  const valor = input.value.trim();
  if (valor.length < 2) errorEl.textContent = 'Debe tener al menos 2 letras';
  else if (!soloLetras.test(valor)) errorEl.textContent = 'Solo letras';
  else errorEl.textContent = '';
}

// ===============================
// ASISTENCIA
// ===============================
document.querySelectorAll('input[name="asistencia"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'Sí') {
      // mostrar la pregunta de acompañantes
      acompanantesGroup.style.display = 'block';
      // ocultar botón de agregar persona hasta que se marque que traerá acompañantes
      addPersonaBtn.style.display = 'none';
      personasContainer.style.display = 'none';
      capacidadMsg.style.display = 'block';
      renderPersonas();
    } else {
      // NO ASISTE → ocultar todo
      acompanantesGroup.style.display = 'none';
      addPersonaBtn.style.display = 'none';
      personasContainer.style.display = 'none';
      capacidadMsg.style.display = 'none';
      personas = [];
      renderPersonas();
    }
  });
});

// ===============================
// ACOMPAÑANTES
// ===============================
document.querySelectorAll('input[name="acompanantes"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'si') {
      addPersonaBtn.style.display = 'block';
      personasContainer.style.display = 'block';
      if (personas.length === 0) addPersona();
    } else {
      personasContainer.style.display = 'none';
      addPersonaBtn.style.display = 'none';
      personas = [];
      renderPersonas();
    }
  });
});

// ===============================
// AGREGAR PERSONA
// ===============================
addPersonaBtn.addEventListener('click', addPersona);

function addPersona() {
  personas.push({ tipo: '', nombre: '', edad: '' });
  renderPersonas();
}

// ===============================
// RENDER PERSONAS (decorado)
// ===============================
function renderPersonas() {
  personasContainer.innerHTML = ''; // limpiar

  personas.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'persona-card';

    div.innerHTML = `
      <select class="persona-tipo input-decorado">
        <option value="" ${p.tipo === '' ? 'selected' : ''}>Selecciona tipo</option>
        <option value="adulto" ${p.tipo === 'adulto' ? 'selected' : ''}>Adulto</option>
        <option value="niño" ${p.tipo === 'niño' ? 'selected' : ''}>Niño</option>
      </select>
      <div class="persona-detalle" style="margin-top:8px; display:${p.tipo ? 'block' : 'none'};">
        <input type="text" placeholder="Nombre y apellido" value="${p.nombre}" class="persona-nombre input-decorado">
        ${p.tipo === 'niño' ? `<input type="number" placeholder="Edad" min="0" max="17" value="${p.edad}" class="persona-edad input-decorado">
        <div class="edad-adulto-msg" style="color:red; font-size:12px; margin-top:4px; display:none;">Este niño será contado como adulto debido a que es mayor a 12 años</div>` : ''}
        <button type="button" class="deletePersona boton-eliminar">Eliminar</button>
      </div>
    `;

    const tipoEl = div.querySelector('.persona-tipo');
    const detalleDiv = div.querySelector('.persona-detalle');
    const nombreEl = div.querySelector('.persona-nombre');
    const edadEl = div.querySelector('.persona-edad');
    const deleteBtn = div.querySelector('.deletePersona');
    const edadMsg = div.querySelector('.edad-adulto-msg');

    tipoEl.addEventListener('change', () => {
      p.tipo = tipoEl.value;
      detalleDiv.style.display = p.tipo ? 'block' : 'none';
      renderPersonas();
    });

    if (nombreEl) nombreEl.addEventListener('input', e => p.nombre = e.target.value);

    if (edadEl) {
      edadEl.addEventListener('input', e => {
        let val = Number(e.target.value);
        if (val < 0) val = 0;
        if (val > 17) val = 17;
        e.target.value = val;
        p.edad = val;
        if (val > 12) edadMsg.style.display = 'block';
        else edadMsg.style.display = 'none';
        calcularCapacidad();
      });
    }



    if (nombreEl) {
  nombreEl.addEventListener('input', e => {
    p.nombre = e.target.value;

    // Validación en tiempo real para nombre
    if (p.nombre.trim().length < 2) {
      nombreEl.style.borderColor = 'red';
      nombreEl.title = 'Debe tener al menos 2 letras';
    } else if (!soloLetras.test(p.nombre.trim())) {
      nombreEl.style.borderColor = 'red';
      nombreEl.title = 'Solo letras permitidas';
    } else {
      nombreEl.style.borderColor = '#ccc'; // borde normal
      nombreEl.title = '';
    }
  });
}

if (edadEl) {
  edadEl.addEventListener('input', e => {
    let val = Number(e.target.value);
    if (val < 0) val = 0;
    if (val > 17) val = 17;
    e.target.value = val;
    p.edad = val;

    // Validación en tiempo real para edad
    if (isNaN(val)) {
      edadEl.style.borderColor = 'red';
      edadEl.title = 'Debe ser un número';
    } else {
      edadEl.style.borderColor = '#ccc';
      edadEl.title = '';
    }

    // Mensaje si niño >12
    if (val > 12) edadMsg.style.display = 'block';
    else edadMsg.style.display = 'none';

    calcularCapacidad();
  });
}

    deleteBtn.addEventListener('click', () => {
      personas.splice(i, 1);
      renderPersonas();
    });

    personasContainer.appendChild(div);
  });

  personasContainer.style.display = personas.length ? 'block' : 'none';

  // recalcular solo si la persona principal va
  const asistenciaInput = document.querySelector('input[name="asistencia"]:checked');
  if (asistenciaInput && asistenciaInput.value === 'Sí') {
    calcularCapacidad();
  } else {
    capacidadMsg.style.display = 'none';
  }
}


// ===============================
// CÁLCULO DE HABITACIÓN
// ===============================
function calcularCapacidad() {
  let adultos = 1;
  let niños = 0;
  let niñosExtra = 0;

  personas.forEach(p => {
    if (p.tipo === 'adulto') adultos++;
    if (p.tipo === 'niño') {
      if (Number(p.edad) > 12) adultos++;
      else niños++;
    }
  });

  let habitaciones = Math.ceil(adultos / 3);
  if (niños > habitaciones) niñosExtra = niños - habitaciones;

  let mensaje = `Adultos: ${adultos} | Niños: ${niños} | Habitaciones: ${habitaciones}`;
  if (niñosExtra > 0) mensaje += ` | Niños adicionales: ${niñosExtra} (US$${niñosExtra * 235})`;

  capacidadMsg.textContent = mensaje;
  capacidadMsg.style.display = 'block';
}

// ===============================
// SUBMIT
// ===============================
const errorAcompanantes = document.getElementById('errorAcompanantes');

document.getElementById('rsvpForm').addEventListener('submit', async e => {
  e.preventDefault();

  const asistenciaInput = document.querySelector('input[name="asistencia"]:checked');
  if (!asistenciaInput) {
    errorAsistencia.textContent = 'Selecciona una opción';
    return;
  } else {
    errorAsistencia.textContent = '';
  }

  // ✨ VALIDACIÓN: nombre y apellido obligatorio
  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();
  let valid = true;

  if (nombre.length < 2 || !soloLetras.test(nombre)) {
    errorNombre.textContent = 'Ingresa un nombre válido';
    valid = false;
  } else {
    errorNombre.textContent = '';
  }

  if (apellido.length < 2 || !soloLetras.test(apellido)) {
    errorApellido.textContent = 'Ingresa un apellido válido';
    valid = false;
  } else {
    errorApellido.textContent = '';
  }

  if (!valid) return;

  // ✨ VALIDACIÓN: acompañantes obligatorio si asistirá
  if (asistenciaInput.value === 'Sí') {
    const acompanantesInput = document.querySelector('input[name="acompanantes"]:checked');
    if (!acompanantesInput) {
      errorAcompanantes.textContent = 'Debes indicar si traerás acompañantes';
      return;
    } else {
      errorAcompanantes.textContent = '';
    }
  }

  // Cargar payload
  const payload = {
    nombre,
    apellido,
    asistencia: asistenciaInput.value,
    acompanantes: personas
  };

  try {
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error(err);
  }

  // VIDEO y WHATSAPP
  const mensaje = `Hola, soy ${payload.nombre} ${payload.apellido} y ${payload.asistencia === 'Sí' ? 'sí' : 'no'} asistiré a la boda`;
  const whatsappURL = `https://wa.me/18296442008?text=${encodeURIComponent(mensaje)}`;

  if (payload.asistencia === 'Sí') {
    const overlay = document.getElementById('videoOverlay');
    const video = document.getElementById('invitacionVideo');
    overlay.style.display = 'flex';
    video.currentTime = 0;
    video.play();
    video.onended = () => window.location.href = whatsappURL;
  } else {
    window.location.href = whatsappURL;
  }

  document.getElementById('rsvpForm').style.display = 'none';
  document.getElementById('rsvpSuccess').style.display = 'block';
});
