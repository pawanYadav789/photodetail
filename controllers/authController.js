const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

//  Function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '2h' } // Token expires in 2 hours
  );
};

//  Signup Controller
exports.signup = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const checkUserRequest = await pool.request();
    checkUserRequest.input('username', username);
    const checkUser = await checkUserRequest.query('SELECT * FROM users WHERE username = @username');

    if (checkUser.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //  Password is encrypted

    const insertUserRequest = await pool.request();
    insertUserRequest.input('username', username);
    insertUserRequest.input('password', hashedPassword);
    await insertUserRequest.query('INSERT INTO users (username, password) VALUES (@username, @password)');

    res.json({ success: true, message: 'Signup successful' });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

//  Login Controller
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const loginRequest = await pool.request();
    loginRequest.input('username', username);
    const result = await loginRequest.query('SELECT * FROM users WHERE username = @username');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password); //  Compare hashed password

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken(user); //  Generate token

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};
