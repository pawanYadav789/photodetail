const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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
      schoolId
    } = req.body;

    const filename = req.file?.filename || null;

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
        INSERT INTO student_entries 
        (name, address, fatherName, schoolName, dateOfBirth, studentId, className, mobileNo, section, schoolId, photo)
        VALUES (@name, @address, @fatherName, @schoolName, @dateOfBirth, @studentId, @className, @mobileNo, @section, @schoolId, @photo)
      `);

    res.json({ success: true });
  } catch (err) {
    console.error('Save Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// ✅ Base64 image भेजने वाला getStudents
exports.getStudents = async (req, res) => {
  try {
    const { class: className, section, schoolId } = req.query;

    let query = 'SELECT * FROM student_entries WHERE 1=1';
    if (schoolId) query += ` AND schoolId = '${schoolId}'`;
    if (className) query += ` AND className = '${className}'`;
    if (section) query += ` AND section = '${section}'`;

    const request = pool.request();
    const result = await request.query(query);
    const students = result.recordset;

    const studentsWithBase64 = students.map(student => {
      const photoPath = path.join(__dirname, '../uploads', student.photo || '');
      let base64Image = '';

      if (student.photo && fs.existsSync(photoPath)) {
        const imageBuffer = fs.readFileSync(photoPath);
        base64Image = imageBuffer.toString('base64');
      }

      return {
        ...student,
        photo: base64Image,
      };
    });

    res.json({ success: true, data: studentsWithBase64 });
  } catch (err) {
    console.error('Get Students Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const { class: className, section, schoolId } = req.query;

    let query = 'SELECT * FROM student_entries WHERE 1=1';
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
      if (student.photo && fs.existsSync(imagePath)) {
        const imageId = workbook.addImage({
          filename: imagePath,
          extension: 'jpeg'
        });

        worksheet.addImage(imageId, {
          tl: { col: 8, row: rowIndex - 1 },
          ext: { width: 80, height: 80 }
        });
      }
    }

    const filePath = path.join(__dirname, '../uploads', 'report.xlsx');
    await workbook.xlsx.writeFile(filePath);
    res.download(filePath);
  } catch (err) {
    console.error('Excel Export Error:', err);
    res.status(500).send('Excel generation failed');
  }
};
