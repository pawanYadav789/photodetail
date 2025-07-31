// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, signup } = require('../controllers/authController');

// ✅ Signup route
router.post('/signup', signup);

// ✅ Login route
router.post('/login', login);

module.exports = router;
