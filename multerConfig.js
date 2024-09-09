const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const propertyId = req.body.propertyId || 'property';
        const email = req.body.email || 'user';
        const date = new Date().toISOString().replace(/:/g, '-');
        const uploadType = req.body.uploadType || 'photo'; // 'propertyPhoto' or 'legalDocPhoto'

        const fileName = `${email}-${date}${path.extname(file.originalname)}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 6 }, // Limit to 6MB
    fileFilter: fileFilter
});

module.exports = upload;