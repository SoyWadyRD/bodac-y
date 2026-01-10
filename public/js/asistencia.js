document.addEventListener('DOMContentLoaded', async () => {
  const role = localStorage.getItem('role');
  if (role !== 'admin') return window.location.href = '/index.html';

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
    console.error('Error cargando asistencias', error);
  }
});

// EXPORTAR A EXCEL con RESUMEN arriba
document.getElementById('exportBtn').addEventListener('click', async () => {
  try {
    const res = await fetch('/api/attendance');
    const data = await res.json();

    let total = data.length;
    let yes = data.filter(a => a.asistencia === 'Sí').length;
    let no = data.filter(a => a.asistencia === 'No').length;

    // Creamos un array para Excel con resumen
    const wsData = [
      { Resumen: "Total solicitudes", Cantidad: total },
      { Resumen: "Asistirán", Cantidad: yes },
      { Resumen: "No asistirán", Cantidad: no },
      {}, // fila vacía
      ...data.map(item => ({
        Nombre: item.nombre,
        Apellido: item.apellido,
        Asistencia: item.asistencia,
        Fecha: item.fecha
      }))
    ];

    const ws = XLSX.utils.json_to_sheet(wsData, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");
    XLSX.writeFile(wb, "Asistencias.xlsx");

  } catch (error) {
    console.error("Error exportando a Excel:", error);
  }
});
