const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get('/', async (req, res) => {
  try {
    const pagos = await Payment.find();
    res.json({ success: true, data: pagos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { attendanceId, tipo, monto } = req.body;

    if (!attendanceId || !tipo || !monto) {
      return res.status(400).json({ success: false });
    }

    let payment = await Payment.findOne({ attendanceId });

    if (!payment) {
      payment = new Payment({
        attendanceId,
        movimientos: [],
        total: 0
      });
    }

    // ✅ Crear movimiento REAL
    const nuevoMovimiento = {
      tipo,
      monto,
      fecha: new Date()
    };

    // ✅ Guardar movimiento
    payment.movimientos.push(nuevoMovimiento);

    // Recalcular total
    if (tipo === 'agregar') payment.total += monto;
    if (tipo === 'quitar') payment.total -= monto;

    if (payment.total < 0) payment.total = 0;

    payment.updatedAt = new Date();
    await payment.save();

    // ✅ RESPUESTA CORRECTA (UNA SOLA)
    res.json({
      success: true,
      total: payment.total,
      movimiento: nuevoMovimiento
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});



module.exports = router;
