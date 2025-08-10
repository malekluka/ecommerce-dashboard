const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Protected user profile route
router.get('/profile', authMiddleware, (req, res) => {
  // Example: return the authenticated user's info
  res.json({ user: req.user });
});

module.exports = router;