import React, { useState } from 'react';
import CSVUpload from './CSVUpload';
import CSVPreview from './CSVPreview';

export default function TestCSVUpload() {
    const [showUpload, setShowUpload] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [csvData, setCsvData] = useState(null);

    const handleFileUpload = (data) => {
        console.log('File uploaded:', data);
        setCsvData(data);
        setShowUpload(false);
        setShowPreview(true);
    };

    const handleUseData = (data) => {
        console.log('Using CSV data:', data);
        setShowPreview(false);
        alert('CSV data would be sent to AI here!');
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">CSV Upload Test</h1>
            <button
                onClick={() => setShowUpload(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
            >
                Test CSV Upload
            </button>

            {showUpload && (
                <CSVUpload
                    onFileUpload={handleFileUpload}
                    onClose={() => setShowUpload(false)}
                />
            )}

            {showPreview && csvData && (
                <CSVPreview
                    csvData={csvData}
                    onClose={() => setShowPreview(false)}
                    onUseData={handleUseData}
                />
            )}
        </div>
    );
} 