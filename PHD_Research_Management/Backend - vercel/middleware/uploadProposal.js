const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Base upload folder
const baseFolder = path.join(__dirname, '..', 'uploads');
const proposalFolder = path.join(baseFolder, 'proposals');

// Auto-create folders if not exist
if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(proposalFolder)) {
    fs.mkdirSync(proposalFolder, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, proposalFolder);
    },
    filename: (req, file, cb) => {
        // Unique filename: studentId + timestamp + original name
        const safeName = file.originalname.replace(/\s+/g, '_');
        const uniqueName = Date.now() + '-' + safeName;

        cb(null, uniqueName);
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

const uploadProposal = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB max
});

module.exports = uploadProposal;
