const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const File = require('./models/File');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for the frontend URL 
app.use(cors({
    origin: process.env.FRONTEND_URL
}));

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Set up Multer for in-memory storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()} - ${file.originalname}`)
    }
})
const upload = multer({ storage: storage });

// Handle file upload with PUT method
// app.put('/upload/:id', upload.array('files'), async (req, res) => {
app.put('/upload/:id', async (req, res) => {
    try {
        await upload.array("files")(req, res, async (err) => {
            if (err) {
                return res.status(200).json({ message: 'File upload error', success: false });
            }

            const files = req.files;
            if (!files || files.length !== 2) {
                return res.status(400).json({ message: 'Please upload exactly 2 files.' });
            }

            const [resume, profilePhoto] = files;

            // Check if originalname is present
            if (!resume.originalname || !profilePhoto.originalname || !resume.filename || !profilePhoto.filename) {
                return res.status(400).json({ message: 'File metadata is missing.' });
            }

            newData = {
                resume_name: resume?.filename,
                profile_name: profilePhoto?.filename
            }

            // Find the existing file record
            const fileId = req.params.id;
            const existingFile = await File.findById(fileId);

            if (!existingFile) {
                return res.status(404).json({ message: 'File record not found' });
            }

            // Update file URLs in MongoDB
            const updatedFile = await File.findByIdAndUpdate(
                fileId,
                {
                    resume_name: resume?.filename,
                    profile_name: profilePhoto?.filename
                },
                { new: true, runValidators: true }
            );

            if (!updatedFile) {
                return res.status(404).json({ message: 'File not found' });
            } else {
                // fs.unlink(path.join(__dirname + '/../uploads/' + existingFile?.resume_name), (err) => {
                fs.unlink(path.join(__dirname + '/uploads/' + existingFile?.resume_name), (err) => {
                    if (err) {  
                        return res.status(200).json({
                            success: true,
                            message: 'Files uploaded and record updated successfully',
                            updatedFile
                        })
                    }

                    // fs.unlink(path.join(__dirname + '/../uploads/' + existingFile?.profile_name), (err) => {
                    fs.unlink(path.join(__dirname + '/uploads/' + existingFile?.profile_name), (err) => {
                        if (err) {
                            return res.status(200).json({
                                success: true,
                                message: 'Files uploaded and record updated successfully',
                                 updatedFile
                            })
                        }
                        return res.status(200).json({
                            success: true,
                            message: 'Files uploaded and record updated successfully',
                            updatedFile
                        });
                    })
                })
            }
        })

    } catch (err) {
        return res.status(200).json(
            { message: 'Error uploading files', message2: err.message, suucess: false }
        )
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
