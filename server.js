const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const multer = require('multer');
const express = require('express');
const app = express();

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Set up file upload folder
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// Set up multer for file uploading
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);  // Store files in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Generate unique filename
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Only allow specific file types (e.g., images, text files)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    res.send(`<h1>File uploaded successfully!</h1><p>File: ${req.file.filename}</p>`);
});

// Error handling for file upload
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        res.status(500).send(err.message);
    } else if (err) {
        // Other errors
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
