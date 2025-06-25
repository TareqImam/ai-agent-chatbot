import express from 'express';
import upload from '../middleware/upload.js';
import { uploadCSV, getCSVPreview, deleteUploadedFile } from '../controllers/uploadController.js';

const router = express.Router();

// Upload CSV file
router.post('/csv', upload.single('csvFile'), uploadCSV);

// Get CSV preview
router.get('/preview/:filePath', getCSVPreview);

// Delete uploaded file
router.delete('/file/:filePath', deleteUploadedFile);

export default router; 