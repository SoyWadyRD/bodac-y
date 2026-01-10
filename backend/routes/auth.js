const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  const { user, password } = req.body;

  if (
    user === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      role: 'admin',
      token: 'admin-session'
    });
  }

  res.status(401).json({ success: false });
});

module.exports = router;
