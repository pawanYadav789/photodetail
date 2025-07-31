const express = require('express');
const {
  saveStudent,
  getStudents,
  downloadExcel
} = require('../controllers/studentController');
const upload = require('../middlewares/upload');
const verifyToken = require('../middlewares/auth'); //  Enable this

const router = express.Router();

//  POST: Save Student (protected)
router.post('/student', upload, saveStudent);


//  GET: Get Student List (protected)
router.get('/students', verifyToken, getStudents); 

//  GET: Export Excel (protected)
router.get('/students/export', verifyToken, downloadExcel); 

module.exports = router;
