require('dotenv').config({ path: './backend/.env' });

const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const galleryRouter = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar MongoDB
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api', require('./routes/auth')); // 👈 AQUÍ
// Rutas
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/gallery', galleryRouter); // <--- IMPORTANTE

// Servir frontend
app.use(express.static(path.join(__dirname, '../public')));

// Test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend + Mongo funcionando 🚀' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
