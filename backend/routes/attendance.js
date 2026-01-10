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


module.exports = router;
