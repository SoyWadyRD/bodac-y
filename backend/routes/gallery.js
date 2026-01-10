// routes/gallery.js
const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// --------------------
// Subir foto (usuario)
// --------------------
// --------------------
// Subir foto (usuario o admin)
// --------------------
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const role = req.body.role || 'user'; // viene del front

    const folder = role === 'admin' ? 'approved_gallery' : 'pending_gallery';
    const status = role === 'admin' ? 'approved' : 'pending';

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    // Guardamos en DB
    const photo = new Photo({
      url: result.secure_url,
      public_id: result.public_id,
      status,
      uploadedBy: req.body.user || 'user'
    });
    await photo.save();

    res.json({ 
      success: true, 
      message: role === 'admin' ? 'Foto subida directamente a la galería' : 'Foto enviada para revisión',
      photo 
    });
  } catch(err){
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al subir la foto', error: err.message });
  }
});

// --------------------
// Listar fotos aprobadas (para galería)
// --------------------
router.get('/approved', async (req, res) => {
  try{
    const photos = await Photo.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(photos);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Listar fotos pendientes (para admin)
// --------------------
router.get('/pending', async (req, res) => {
  try{
    const photos = await Photo.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(photos);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Admin acepta foto
// --------------------
router.post('/approve/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if(!photo) return res.status(404).json({ message: 'Foto no encontrada' });

    // --- Subir a approved_gallery ---
    const result = await cloudinary.uploader.upload(photo.url, {
      folder: 'approved_gallery',
      public_id: photo.public_id.split('/').pop(),
      overwrite: true
    });

    // --- Eliminar de pending_gallery ---
    await cloudinary.uploader.destroy(photo.public_id);

    // --- Actualizar DB ---
    photo.url = result.secure_url;
    photo.public_id = result.public_id;
    photo.status = 'approved';
    await photo.save();

    res.json({ success: true, message: 'Foto aprobada y movida a galería', photo });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Admin rechaza foto
// --------------------
router.post('/reject/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if(!photo) return res.status(404).json({ message: 'Foto no encontrada' });

    // --- Subir a trash_gallery ---
    const result = await cloudinary.uploader.upload(photo.url, {
      folder: 'trash_gallery',
      public_id: photo.public_id.split('/').pop(),
      overwrite: true
    });

    // --- Eliminar de pending_gallery ---
    await cloudinary.uploader.destroy(photo.public_id);

    // --- Actualizar DB ---
    photo.url = result.secure_url;
    photo.public_id = result.public_id;
    photo.status = 'trash';
    await photo.save();

    res.json({ success: true, message: 'Foto enviada a papelera', photo });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// Eliminar foto de Cloudinary y DB (opcional)
// --------------------
router.delete('/:id', async (req, res) => {
  try{
    const photo = await Photo.findById(req.params.id);
    if(!photo) return res.status(404).json({ message: 'Foto no encontrada' });

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(photo.public_id);

    // Eliminar de la DB
    await photo.deleteOne();

    res.json({ success: true, message: 'Foto eliminada completamente' });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Listar fotos en trash
router.get('/trash', async (req, res) => {
  try {
    const photos = await Photo.find({ status: 'trash' }).sort({ createdAt: -1 });
    res.json(photos);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Restaurar foto de trash a approved
// Restaurar foto de trash a approved
router.post('/restore/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Foto no encontrada' });

    // --- Subir la foto desde trash_gallery a approved_gallery ---
    const result = await cloudinary.uploader.upload(photo.url, {
      folder: 'approved_gallery',
      public_id: photo.public_id.split('/').pop(), // mismo nombre de archivo
      overwrite: true
    });

    // --- Eliminar la foto antigua de trash_gallery ---
    await cloudinary.uploader.destroy(photo.public_id);

    // --- Actualizar DB ---
    photo.url = result.secure_url;
    photo.public_id = result.public_id;
    photo.status = 'approved';
    await photo.save();

    res.json({ success: true, message: 'Foto restaurada a galería', photo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Enviar foto aprobada a trash (solo admin)
router.post('/trash/:id', async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Foto no encontrada' });

    // --- Subir a trash_gallery ---
    const result = await cloudinary.uploader.upload(photo.url, {
      folder: 'trash_gallery',
      public_id: photo.public_id.split('/').pop(),
      overwrite: true
    });

    // --- Eliminar de approved_gallery ---
    await cloudinary.uploader.destroy(photo.public_id);

    // --- Actualizar DB ---
    photo.url = result.secure_url;
    photo.public_id = result.public_id;
    photo.status = 'trash';
    await photo.save();

    res.json({ success: true, message: 'Foto enviada a papelera', photo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
