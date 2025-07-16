const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// 🔹 Save student data with base64 image
exports.saveStudent = async (req, res) => {
  try {
    const {
      name,
      address,
      fatherName,
      schoolName,
      dateOfBirth,
      studentId,
      className,
      mobileNo,
      section,
      schoolId,
      photo // ⬅️ Base64 string expected from frontend
    } = req.body;

    let filename = null;

    if (photo) {
      filename = `${Date.now()}.jpg`;
      const buffer = Buffer.from(photo, 'base64');
      const uploadPath = path.join(__dirname, '../uploads', filename);
      fs.writeFileSync(uploadPath, buffer);
    }

    const request = pool.request();
    await request
      .input('name', name)
      .input('address', address)
      .input('fatherName', fatherName)
      .input('schoolName', schoolName)
      .input('dateOfBirth', dateOfBirth)
      .input('studentId', studentId)
      .input('className', className)
      .input('mobileNo', mobileNo)
      .input('section', section)
      .input('schoolId', schoolId)
      .input('photo', filename)
      .query(`
        INSERT INTO students 
        (name, address, fatherName, schoolName, dateOfBirth, studentId, className, mobileNo, section, schoolId, photo)
        VALUES (@name, @address, @fatherName, @schoolName, @dateOfBirth, @studentId, @className, @mobileNo, @section, @schoolId, @photo)
      `);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// 🔹 Get students with optional filters
exports.getStudents = async (req, res) => {
  try {
    const { class: className, section, schoolId } = req.query;

    let query = 'SELECT * FROM students WHERE 1=1';
    if (schoolId) query += ` AND schoolId = '${schoolId}'`;
    if (className) query += ` AND className = '${className}'`;
    if (section) query += ` AND section = '${section}'`;

    const request = pool.request();
    const result = await request.query(query);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// 🔹 Export filtered students to Excel with images
exports.downloadExcel = async (req, res) => {
  try {
    const { class: className, section, schoolId } = req.query;

    let query = 'SELECT * FROM students WHERE 1=1';
    if (schoolId) query += ` AND schoolId = '${schoolId}'`;
    if (className) query += ` AND className = '${className}'`;
    if (section) query += ` AND section = '${section}'`;

    const request = pool.request();
    const result = await request.query(query);
    const students = result.recordset;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'DOB', key: 'dateOfBirth', width: 15 },
      { header: 'Mobile', key: 'mobileNo', width: 15 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Class', key: 'className', width: 10 },
      { header: 'Section', key: 'section', width: 10 },
      { header: 'Photo', key: 'photo', width: 15 }
    ];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowIndex = i + 2;
      worksheet.addRow({ ...student });

      const imagePath = path.join(__dirname, '../uploads', student.photo);
      if (fs.existsSync(imagePath)) {
        const imageId = workbook.addImage({
          filename: imagePath,
          extension: 'jpeg'
        });

        worksheet.addImage(imageId, {
          tl: { col: 8, row: rowIndex - 1 },
          ext: { width: 100, height: 100 }
        });
      }
    }

    const filePath = path.join(__dirname, '../uploads', 'report.xlsx');
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Excel generation failed');
  }
};
