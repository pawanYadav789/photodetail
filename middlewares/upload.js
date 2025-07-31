const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// In-memory storage for processing in sharp
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// Middleware for compression
const compressAndSave = (req, res, next) => {
  upload.single('photo')(req, res, async function (err) {
    if (err) return res.status(400).json({ success: false, error: err.message });

    if (!req.file) return next(); // No file uploaded

    const filename = `${Date.now()}.jpeg`;
    const filepath = path.join(__dirname, '../uploads', filename);

    try {
      await sharp(req.file.buffer)
        .resize(300) // Optional: Resize
        .jpeg({ quality: 70 })
        .toFile(filepath);

      req.file.filename = filename; // Set filename for controller
      next();
    } catch (err) {
      console.error('Sharp Error:', err);
      res.status(500).json({ success: false, error: 'Image compression failed' });
    }
  });
};

module.exports = compressAndSave;
