const mongoose = require('mongoose');

const acompananteSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['adulto', 'niño'], required: true },
  nombre: { type: String, required: true },
  edad: { type: Number } // solo para niños
});

const attendanceSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  asistencia: { type: String, enum: ['Sí', 'No'], required: true },
  acompanantes: [acompananteSchema], // <-- aquí van los acompañantes
  costoExtra: { type: Number, default: 0 }, // nuevo campo
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
