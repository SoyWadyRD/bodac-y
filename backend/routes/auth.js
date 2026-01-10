const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { user, password } = req.body;

  if (
    user === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // Mensaje en la consola
    console.log(`🟢 Usuario "${user}" inició sesión correctamente en ${new Date().toLocaleString()}`);

    return res.json({
      success: true,
      role: 'admin',
      token: 'admin-session'
    });
  }

  console.log(`⚠️ Intento de login fallido con usuario "${user}" en ${new Date().toLocaleString()}`);

  res.status(401).json({ success: false });
});

module.exports = router;
