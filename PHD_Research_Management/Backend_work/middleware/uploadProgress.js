const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Base folder
const baseFolder = path.join(__dirname, '..', 'uploads');
const reportFolder = path.join(baseFolder, 'progress_reports');

//auto create folder
if(!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if(!fs.existsSync(reportFolder)) {
    fs.mkdirSync(reportFolder, { recursive: true });
}

// Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, reportFolder);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        const uniquename = Date.now() + '-' + safeName;
        cb(null, uniquename);
    }
});

// Allow only PDF / Word
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only PDF or Word files are allowed'));
    }

    cb(null, true);
};

const uploadProgress = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024} // 20MB
});

module.exports = uploadProgress;