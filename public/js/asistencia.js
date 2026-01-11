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

    const csvRows = [];

    // Resumen
    csvRows.push(['Resumen', 'Cantidad']);
    csvRows.push(['Total solicitudes', total]);
    csvRows.push(['Asistirán', yes]);
    csvRows.push(['No asistirán', no]);
    csvRows.push([]); // línea vacía

    // Cabecera
    csvRows.push(['Nombre', 'Apellido', 'Asistencia', 'Fecha']);

    // Datos
    data.forEach(item => {
      csvRows.push([
        item.nombre,
        item.apellido,
        item.asistencia,
        item.fecha
      ]);
    });

    // Convertir a CSV
    const csvContent = csvRows
      .map(row => row.map(v => `"${v ?? ''}"`).join(','))
      .join('\n');

    // Descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Asistencias.csv';
    a.click();

    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error exportando CSV:', error);
  }
});

