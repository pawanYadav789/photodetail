// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ ADD this line

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files (images, excel)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// ✅ Routes
app.use('/api', studentRoutes);
app.use('/api', authRoutes); // ✅ ADD this line for login route

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
