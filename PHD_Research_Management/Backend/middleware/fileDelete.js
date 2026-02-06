const fs = require('fs');
const path = require('path');

exports.deleteFile = (filePath) => {
    if (filePath) {
        // Construct absolute path (adjust based on your structure)
        const fullPath = path.join(__dirname, '..', filePath);
        fs.unlink(fullPath, (err) => {
            if (err) console.error(`Failed to delete file: ${fullPath}`, err);
        });
    }
};