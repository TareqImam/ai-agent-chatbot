import fs from 'fs';
import path from 'path';

export const parseCSV = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length === 0) {
            return {
                success: false,
                error: 'File is empty'
            };
        }

        // Parse headers (first line)
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        // Parse data rows (skip header)
        const data = lines.slice(1, 6).map(line => { // Only get first 5 rows for preview
            const values = line.split(',').map(value => value.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });

        return {
            success: true,
            headers,
            data,
            totalRows: lines.length - 1,
            previewRows: Math.min(5, lines.length - 1)
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export const getFileInfo = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        return {
            size: stats.size,
            sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
            lastModified: stats.mtime
        };
    } catch (error) {
        return null;
    }
}; 