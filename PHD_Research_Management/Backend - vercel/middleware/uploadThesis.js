const multer = require('multer');
const fs = require('fs');
const path = require('path');

// folders
const baseFolder = path.join(__dirname, '..', 'uploads');
const thesisFolder = path.join(baseFolder, 'thesis');

if (!fs.existsSync(thesisFolder)) {
    fs.mkdirSync(thesisFolder, { recursive: true });
}

// storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, thesisFolder);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        const uniqueName = Date.now() + '-' + safeName;
        cb(null, uniqueName);
    }
});

// allow pdf & word
const fileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error('Only PDF or Word files allowed'));
    }

    cb(null, true);
};

const uploadThesis = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

module.exports = uploadThesis;