// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db'); // your MSSQL pool

const JWT_SECRET = 'your_jwt_secret'; // 🔒 Replace with env variable in production

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const request = await pool.request();
    const result = await request
      .input('username', username)
      .query('SELECT * FROM users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, school_id: user.school_id },
      JWT_SECRET,
      { expiresIn: '3d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        school_id: user.school_id,
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
