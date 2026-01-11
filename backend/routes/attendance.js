const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Attendance = require('../models/Attendance');

router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, asistencia } = req.body;

    const nuevaConfirmacion = new Attendance({
      nombre,
      apellido,
      asistencia
    });

    await nuevaConfirmacion.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/', async (req, res) => {
  try {
    const asistencias = await Attendance
      .find()
      .sort({ createdAt: -1 });

    const data = asistencias.map(item => ({
      id: item._id,
      nombre: item.nombre,
      apellido: item.apellido,
      asistencia: item.asistencia,
      fecha: moment(item.createdAt)
        .tz('America/Santo_Domingo')
        .format('DD/MM/YYYY hh:mm A')
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});








router.get('/export', async (req, res) => {
  try {
    const asistencias = await Attendance
      .find()
      .sort({ createdAt: 1 });

    let total = asistencias.length;
    let yes = asistencias.filter(a => a.asistencia === 'Sí').length;
    let no = asistencias.filter(a => a.asistencia === 'No').length;

    let csv = '';

    // Resumen
    csv += 'Resumen,Cantidad\n';
    csv += `Total solicitudes,${total}\n`;
    csv += `Asistirán,${yes}\n`;
    csv += `No asistirán,${no}\n\n`;

    // Cabecera
    csv += 'Nombre,Apellido,Asistencia,Fecha\n';

    asistencias.forEach(item => {
      csv += `"${item.nombre}","${item.apellido}","${item.asistencia}","${moment(item.createdAt)
        .tz('America/Santo_Domingo')
        .format('DD/MM/YYYY hh:mm A')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Asistencias.csv'
    );

    res.send(csv);

  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).send('Error generando CSV');
  }
});



module.exports = router;
