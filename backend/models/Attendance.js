const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  asistencia: String,
  createdAt: {
    type: Date,
    default: Date.now // UTC
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
