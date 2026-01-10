// models/Photo.js
const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },        // URL de Cloudinary
  public_id: { type: String, required: true },  // ID en Cloudinary
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'trash'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
