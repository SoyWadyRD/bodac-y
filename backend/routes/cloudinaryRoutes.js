const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Solo usamos memoryStorage, no guardamos nada local
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Listar fotos de una carpeta
// Listar fotos de una carpeta
router.get('/list', async (req, res) => {
  const folder = req.query.folder || 'public_photos';
  try {
    const result = await cloudinary.api.resources({ 
      type: 'upload', 
      prefix: folder, 
      max_results: 100 
    });

    // Devolver array de objetos { secure_url, public_id }
    const data = result.resources ? result.resources.map(img => ({
      secure_url: img.secure_url,
      public_id: img.public_id
    })) : [];

    res.json(data);
  } catch (err) {
    console.error('Error Cloudinary list:', err);
    res.status(500).json({ error: err.message });
  }
});


// Subir foto (solo admin)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const folder = req.body.folder || 'public_photos';

    // Subida en memoria con stream
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
    res.json(result);

  } catch (err) {
    console.error('Error subiendo foto:', err);
    res.status(500).json({ error: err.message });
  }
});




// Eliminar foto del slider (solo admin)
router.delete('/delete', async (req, res) => {
  try {
    const { public_id } = req.body; // El public_id de la foto en Cloudinary

    if (!public_id) return res.status(400).json({ error: 'Falta public_id' });

    const result = await cloudinary.uploader.destroy(public_id);
    res.json(result);

  } catch (err) {
    console.error('Error eliminando foto:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
