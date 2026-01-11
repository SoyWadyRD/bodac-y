document.addEventListener('DOMContentLoaded', async () => {

  // ===== VALIDAR ADMIN =====
  const role = localStorage.getItem('role');
  if (role !== 'admin') {
    window.location.href = '/index.html';
    return;
  }

  // ===== CARGAR TABLA =====
  try {
    const res = await fetch('/api/attendance');
    const data = await res.json();

    const tbody = document.querySelector('#attendanceTable tbody');
    tbody.innerHTML = '';

    let total = data.length;
    let yes = 0;
    let no = 0;

  data.forEach(item => {
  if (item.asistencia === 'Sí') yes++;
  if (item.asistencia === 'No') no++;

  const tr = document.createElement('tr');

  // 👉 CLASE SEGÚN ASISTENCIA
  if (item.asistencia === 'Sí') {
    tr.classList.add('row-yes');
  } else if (item.asistencia === 'No') {
    tr.classList.add('row-no');
  }

  tr.innerHTML = `
    <td data-label="Nombre">${item.nombre}</td>
    <td data-label="Apellido">${item.apellido}</td>
    <td data-label="Asistencia">${item.asistencia}</td>
    <td data-label="Fecha">${item.fecha}</td>
  `;

  tbody.appendChild(tr);
});



    document.getElementById('totalCount').textContent = total;
    document.getElementById('yesCount').textContent = yes;
    document.getElementById('noCount').textContent = no;

  } catch (error) {
    console.error('Error cargando asistencias:', error);
  }

  // ===== EXPORTAR CSV (BACKEND) =====
  const exportBtn = document.getElementById('exportBtn');

  if (!exportBtn) {
    console.error('Botón exportBtn no encontrado');
    return;
  }

  exportBtn.addEventListener('click', () => {
    // 🔥 Descarga directa desde el backend (APK compatible)
    window.location.href = '/api/attendance/export';
  });

});
