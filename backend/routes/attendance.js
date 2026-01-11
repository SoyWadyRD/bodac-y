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

    // Calcular niños extra
    let adultos = 1;
    let ninos = 0;

    acompValidos.forEach(a => {
      if (a.tipo === 'adulto') adultos++;
      if (a.tipo === 'niño') {
        if (Number(a.edad) > 12) adultos++;
        else ninos++;
      }
    });

    const habitaciones = Math.ceil(adultos / 3);
    const ninosExtra = ninos > habitaciones ? ninos - habitaciones : 0;
    const costoExtra = ninosExtra * 235;

    const nuevaConfirmacion = new Attendance({
      nombre,
      apellido,
      asistencia,
      acompanantes: acompValidos,
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
      let adultos = 1;
      let ninos = 0;

      const acomp = (item.acompanantes || []).map(a => {
        if (a.tipo === 'adulto') adultos++;
        if (a.tipo === 'niño') {
          if (Number(a.edad) > 12) adultos++;
          else ninos++;
        }
        return {
          nombre: a.nombre,
          tipo: a.tipo,
          edad: a.edad || ''
        };
      });

      const habitaciones = Math.ceil(adultos / 3);
      totalHabitaciones += habitaciones;
      totalPersonas += adultos + ninos;

      return {
        id: item._id,
        nombre: item.nombre,
        apellido: item.apellido,
        asistencia: item.asistencia,
        fecha: moment(item.createdAt).tz('America/Santo_Domingo').format('DD/MM/YY hh:mm A'),
        acompanantes: acomp,
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

    let total = asistencias.length;
    let yes = asistencias.filter(a => a.asistencia === 'Sí').length;
    let no = asistencias.filter(a => a.asistencia === 'No').length;

    // Totales globales de personas y habitaciones
    let totalPersonas = 0;
    let totalHabitaciones = 0;

    asistencias.forEach(item => {
      if(item.asistencia === 'Sí') {
        let adultos = 1; // titular
        let ninos = 0;

        (item.acompanantes || []).forEach(a => {
          if(a.tipo === 'adulto') adultos++;
          if(a.tipo === 'niño') {
            if(a.edad && a.edad > 12) adultos++; // niño >12 contado como adulto
            else ninos++;
          }
        });

        totalPersonas += adultos + ninos;
        totalHabitaciones += Math.ceil(adultos / 3);
      }
    });

    let csv = '';

    // Resumen
    csv += 'Resumen,Cantidad\n';
    csv += `Total solicitudes,${total}\n`;
    csv += `Asistirán,${yes}\n`;
    csv += `No asistirán,${no}\n`;
    csv += `Total de personas,${totalPersonas}\n`;
    csv += `Total de habitaciones,${totalHabitaciones}\n\n`;

    // Cabecera completa
    csv += 'Nombre,Apellido,Asistencia,Fecha,Total de personas,Habitaciones,Niños adicionales,Costo adicional,Lista de acompañantes\n';

    // Detalle por cada solicitud
    asistencias.forEach(item => {
      let adultos = 1; // titular
      let ninos = 0;
      let acompanantesLista = '';

      (item.acompanantes || []).forEach(a => {
        if(a.tipo === 'adulto') adultos++;
        if(a.tipo === 'niño') {
          if(a.edad && a.edad > 12) adultos++;
          else ninos++;
        }
        acompanantesLista += a.tipo === 'niño' 
          ? `Niño: ${a.nombre} (Edad: ${a.edad}); ` 
          : `Adulto: ${a.nombre}; `;
      });

      const totalPersonasItem = adultos + ninos;
      const habitaciones = Math.ceil(adultos / 3);
      const ninosExtra = ninos > habitaciones ? ninos - habitaciones : 0;
      const costoExtra = ninosExtra * 235;

      csv += `"${item.nombre}","${item.apellido}","${item.asistencia}","${moment(item.createdAt).tz('America/Santo_Domingo').format('DD/MM/YY hh:mm A')}","${totalPersonasItem}","${habitaciones}","${ninosExtra}","${costoExtra}","${acompanantesLista.trim()}"\n`;
    });

    // 🔥 BOM UTF-8 PARA EXCEL
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
