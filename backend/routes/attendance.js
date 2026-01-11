const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Attendance = require('../models/Attendance');

router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, asistencia, acompanantes } = req.body;

    const acompValidos = (acompanantes || []).filter(a =>
      a.nombre && a.nombre.trim().length >= 2 && ['adulto', 'niño'].includes(a.tipo)
    );

    let adultos = 1;
    let ninos = 0;

    if (asistencia === 'Sí') {
      acompValidos.forEach(a => {
        if (a.tipo === 'adulto') adultos++;
        if (a.tipo === 'niño') {
          if (Number(a.edad) > 12) adultos++;
          else ninos++;
        }
      });
    } else {
      // Si NO asiste, todo en 0
      adultos = 0;
      ninos = 0;
    }

    const habitaciones = asistencia === 'Sí' ? Math.ceil(adultos / 3) : 0;
    const ninosExtra = ninos > habitaciones ? ninos - habitaciones : 0;
    const costoExtra = ninosExtra * 235;
    const totalPersonas = adultos + ninos;

    const nuevaConfirmacion = new Attendance({
      nombre,
      apellido,
      asistencia,
      acompanantes: acompValidos,
      habitaciones,
      totalPersonas,
      costoExtra
    });

    await nuevaConfirmacion.save();

    res.json({ success: true, costoExtra });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});



router.get('/', async (req, res) => {
  try {
    const asistencias = await Attendance.find().sort({ createdAt: -1 });

    let totalPersonas = 0;
let totalHabitaciones = 0;

const data = asistencias.map(item => {
  let adultos = item.asistencia === 'Sí' ? 1 : 0;
  let ninos = 0;

  if(item.asistencia === 'Sí') {
    (item.acompanantes || []).forEach(a => {
      if(a.tipo === 'adulto') adultos++;
      if(a.tipo === 'niño') {
        if(Number(a.edad) > 12) adultos++;
        else ninos++;
      }
    });
  }

  const habitaciones = item.asistencia === 'Sí' ? Math.ceil(adultos / 3) : 0;
  totalHabitaciones += habitaciones;
  totalPersonas += adultos + ninos;

  return {
    id: item._id,
    nombre: item.nombre,
    apellido: item.apellido,
    asistencia: item.asistencia,
    fecha: moment(item.createdAt).tz('America/Santo_Domingo').format('DD/MM/YY hh:mm A'),
    acompanantes: item.acompanantes,
    totalPersonas: adultos + ninos,
    habitaciones
  };
});

    res.json({ data, totalPersonas, totalHabitaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});


router.get('/export', async (req, res) => {
  try {
    const asistencias = await Attendance.find().sort({ createdAt: 1 });

    let totalSolicitudes = asistencias.length;
    let yes = asistencias.filter(a => a.asistencia === 'Sí').length;
    let no = asistencias.filter(a => a.asistencia === 'No').length;

    // Totales globales recalculados
    let totalPersonas = 0;
    let totalHabitaciones = 0;

    asistencias.forEach(item => {
      if (item.asistencia === 'Sí') {
        let adultos = 1; // titular
        let ninos = 0;

        (item.acompanantes || []).forEach(a => {
          if (a.tipo === 'adulto') adultos++;
          if (a.tipo === 'niño') {
            if (a.edad && a.edad > 12) adultos++;
            else ninos++;
          }
        });

        const habitaciones = Math.ceil(adultos / 3);
        totalPersonas += adultos + ninos;
        totalHabitaciones += habitaciones;
      }
    });

    let csv = '';

    // Resumen
    csv += 'Resumen,Cantidad\n';
    csv += `Total solicitudes,${totalSolicitudes}\n`;
    csv += `Asistirán,${yes}\n`;
    csv += `No asistirán,${no}\n`;
    csv += `Total de personas,${totalPersonas}\n`;
    csv += `Total de habitaciones,${totalHabitaciones}\n\n`;

    // Cabecera detalle
    csv += 'Nombre,Apellido,Asistencia,Fecha,Total de personas,Habitaciones,Niños adicionales,Costo adicional,Lista de acompañantes\n';

    // Detalle por solicitud
    asistencias.forEach(item => {
      let adultos = item.asistencia === 'Sí' ? 1 : 0;
      let ninos = 0;
      let acompanantesLista = '';

      if (item.asistencia === 'Sí') {
        (item.acompanantes || []).forEach(a => {
          if (a.tipo === 'adulto') adultos++;
          if (a.tipo === 'niño') {
            if (a.edad && a.edad > 12) adultos++;
            else ninos++;
          }

          acompanantesLista += a.tipo === 'niño'
            ? `Niño: ${a.nombre} (Edad: ${a.edad}); `
            : `Adulto: ${a.nombre}; `;
        });
      }

      const totalPersonasItem = adultos + ninos;
      const habitaciones = item.asistencia === 'Sí' ? Math.ceil(adultos / 3) : 0;
      const ninosExtra = ninos > habitaciones ? ninos - habitaciones : 0;
      const costoExtra = ninosExtra * 235;

      // ✅ Comilla simple delante de la fecha para Excel
      const fechaExcel = `'${moment(item.createdAt).tz('America/Santo_Domingo').format('DD/MM/YY hh:mm A')}`;

      csv += `"${item.nombre}","${item.apellido}","${item.asistencia}","${fechaExcel}","${totalPersonasItem}","${habitaciones}","${ninosExtra}","${costoExtra}","${acompanantesLista.trim()}"\n`;
    });

    // 🔥 BOM UTF-8 para Excel
    const BOM = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=Asistencias.csv');

    res.send(BOM + csv);

  } catch (error) {
    console.error('Error exportando CSV:', error);
    res.status(500).send('Error generando CSV');
  }
});





module.exports = router;
