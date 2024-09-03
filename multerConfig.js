const multer = require('multer');
const path = require('path');

// Configure storage settings
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, req.decoded + path.extname(file.originalname)); // Use original file extension
    }
});

// Configure file filter to accept only certain file types
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6 // Limit to 6MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
