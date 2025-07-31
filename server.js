const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config({ quiet: true }); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

//  Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

//  Routes
app.use('/api', studentRoutes);
app.use('/api/auth', authRoutes);

//  Server Start
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
