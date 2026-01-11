document.addEventListener('DOMContentLoaded', async () => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') return window.location.href = '/index.html';

  try {
    const res = await fetch('/api/attendance');
    const result = await res.json();
    const data = result.data;

    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = '';

    // Totales
    document.getElementById('totalCount').textContent = data.length;
    document.getElementById('yesCount').textContent = data.filter(d => d.asistencia === 'Sí').length;
    document.getElementById('noCount').textContent = data.filter(d => d.asistencia === 'No').length;

    // Totales globales como tarjetas bonitas
    const statsContainer = document.querySelector('.stats');

    const totalPersonasCard = document.createElement('div');
    totalPersonasCard.classList.add('stat-card');
    totalPersonasCard.innerHTML = `<span>${result.totalPersonas}</span><small>Total personas</small>`;
    statsContainer.appendChild(totalPersonasCard);

    const totalHabitacionesCard = document.createElement('div');
    totalHabitacionesCard.classList.add('stat-card');
    totalHabitacionesCard.innerHTML = `<span>${result.totalHabitaciones}</span><small>Total habitaciones</small>`;
    statsContainer.appendChild(totalHabitacionesCard);

    // Renderizar tarjetas individuales
    // Renderizar tarjetas individuales
data.forEach(item => {
  const tr = document.createElement('tr');
  tr.classList.add(item.asistencia === 'Sí' ? 'row-yes' : 'row-no');

  // Lista de acompañantes
  let acompanantesHTML = '';
  if (item.acompanantes && item.acompanantes.length) {
    acompanantesHTML = `<ul class="acompanantes-list">`;
    item.acompanantes.forEach(a => {
      acompanantesHTML += `<li>${a.tipo === 'niño' ? `Niño: ${a.nombre} (Edad: ${a.edad})` : `Adulto: ${a.nombre}`}</li>`;
    });
    acompanantesHTML += `</ul>`;
  } else {
    acompanantesHTML = `<p class="acompanantes-list">—</p>`;
  }

  // ✨ Cálculo de personas y habitaciones según asistencia
  let adultos = 0;
  let ninos = 0;
  let habitaciones = 0;
  let ninosExtra = 0;
  let totalPersonasItem = 0;
  let costoExtra = 0;

  if (item.asistencia === 'Sí') {
    adultos = 1; // titular
    (item.acompanantes || []).forEach(a => {
      if (a.tipo === 'adulto') adultos++;
      if (a.tipo === 'niño') {
        if (a.edad && a.edad > 12) adultos++;
        else ninos++;
      }
    });
    habitaciones = Math.ceil(adultos / 3);
    ninosExtra = ninos > habitaciones ? ninos - habitaciones : 0;
    costoExtra = ninosExtra * 235;
    totalPersonasItem = adultos + ninos;
  }

  // Generar card
  tr.innerHTML = `
    <td colspan="4">
      <div class="card-container">
        <div class="titular-row"><span class="label">Nombre:</span> <span class="value">${item.nombre}</span></div>
        <div class="titular-row"><span class="label">Apellido:</span> <span class="value">${item.apellido}</span></div>
        <div class="acompanantes-row"><strong>Acompañantes:</strong>${acompanantesHTML}</div>
        <div class="info-row"><span class="label">Número de personas:</span> <span class="value">${totalPersonasItem}</span></div>
        <div class="info-row"><span class="label">Habitaciones:</span> <span class="value">${habitaciones}</span></div>
        ${ninosExtra > 0 ? `<div class="info-row" style="color:red;"><strong>Niños adicionales:</strong> ${ninosExtra} (US$${costoExtra})</div>` : ''}
        <div class="footer-row">
          <span class="asistencia-badge ${item.asistencia === 'Sí' ? 'yes' : 'no'}">Asistencia: ${item.asistencia}</span>
          <span class="fecha">Fecha: ${item.fecha}</span>
        </div>
      </div>
    </td>
  `;

  tbody.appendChild(tr);
});




  } catch (error) {
    console.error('Error cargando asistencias:', error);
  }

  // Exportar
  const exportBtn = document.getElementById('exportBtn');
  exportBtn.addEventListener('click', () => {
    window.location.href = '/api/attendance/export';
  });
});
