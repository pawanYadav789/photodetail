const express = require('express');
const { saveStudent, getStudents, downloadExcel } = require('../controllers/studentController');

const router = express.Router();

// ✅ No need for multer anymore
router.post('/student', saveStudent);
router.get('/students', getStudents);
router.get('/students/export', downloadExcel);

module.exports = router;
