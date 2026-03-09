const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
    'public/uploads/before-service', 
    'public/uploads/received-condition', 
    'public/uploads/after-service'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure different storage logic if needed, or keep generic
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(' Multer Destination Check - Stage:', req.body.stage);
        // Default to 'before-service' if stage not provided
        const stage = req.body.stage || 'before-service';
        
        // Map stage to folder names
        let folder = 'before-service';
        if (stage === 'received-condition') folder = 'received-condition';
        if (stage === 'after-service') folder = 'after-service';

        const uploadPath = path.join(process.cwd(), 'public', 'uploads', folder);
        console.log(' Uploading to:', uploadPath);
        if (!fs.existsSync(uploadPath)) {
             console.error(' Upload directory missing:', uploadPath);
             // Attempt to create it just in case
             fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;