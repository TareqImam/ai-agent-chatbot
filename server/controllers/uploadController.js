import { parseCSV, getFileInfo } from '../utils/csvParser.js';
import path from 'path';

export const uploadCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileSize = req.file.size;

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (fileSize > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 5MB limit'
            });
        }

        // Parse CSV for preview
        const csvData = parseCSV(filePath);
        const fileInfo = getFileInfo(filePath);

        if (!csvData.success) {
            return res.status(400).json({
                success: false,
                message: 'Error parsing CSV file',
                error: csvData.error
            });
        }

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                fileName,
                filePath,
                fileSize,
                fileInfo,
                csvPreview: {
                    headers: csvData.headers,
                    data: csvData.data,
                    totalRows: csvData.totalRows,
                    previewRows: csvData.previewRows
                }
            }
        });

    } catch (error) {
        console.error('Error in uploadCSV:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
};

export const getCSVPreview = async (req, res) => {
    try {
        const { filePath } = req.params;
        const fullPath = path.join(process.cwd(), 'uploads', filePath);

        const csvData = parseCSV(fullPath);
        const fileInfo = getFileInfo(fullPath);

        if (!csvData.success) {
            return res.status(400).json({
                success: false,
                message: 'Error parsing CSV file',
                error: csvData.error
            });
        }

        res.status(200).json({
            success: true,
            data: {
                fileInfo,
                csvPreview: {
                    headers: csvData.headers,
                    data: csvData.data,
                    totalRows: csvData.totalRows,
                    previewRows: csvData.previewRows
                }
            }
        });

    } catch (error) {
        console.error('Error in getCSVPreview:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting CSV preview',
            error: error.message
        });
    }
};

export const deleteUploadedFile = async (req, res) => {
    try {
        const { filePath } = req.params;
        const fullPath = path.join(process.cwd(), 'uploads', filePath);

        // Check if file exists
        const fs = await import('fs');
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            res.status(200).json({
                success: true,
                message: 'File deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

    } catch (error) {
        console.error('Error in deleteUploadedFile:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
}; 