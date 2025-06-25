import React, { useState, useRef } from 'react';

export default function MessageInput({ onSubmit, isLoading = false }) {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((input.trim() || selectedFile) && !isLoading && !isUploading) {
            let message = input;
            let fullMessage = input;
            
            // If there's a file, upload it first and include the data in the full message sent to AI
            if (selectedFile) {
                try {
                    setIsUploading(true);
                    const fileData = await uploadFile(selectedFile);
                    if (fileData) {
                        const fileSummary = `I've uploaded a CSV file: ${fileData.fileName}\nHeaders: ${fileData.csvPreview.headers.join(', ')}\nTotal Rows: ${fileData.csvPreview.totalRows}\nPreview Data: ${JSON.stringify(fileData.csvPreview.data, null, 2)}`;
                        fullMessage = message ? `${message}\n\n${fileSummary}` : fileSummary;
                    }
                } catch (error) {
                    setUploadError('Failed to upload file. Please try again.');
                    return;
                } finally {
                    setIsUploading(false);
                }
            }
            
            // Show only the user's typed message in chat, but send full message (with CSV data) to AI
            if (message.trim() || selectedFile) {
                // Display only the user's message in chat
                const displayMessage = message.trim() || `Uploaded CSV file: ${selectedFile.name}`;
                onSubmit(displayMessage, fullMessage);
                setInput('');
                setSelectedFile(null);
                setUploadError('');
            }
        }
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('csvFile', file);

        const response = await fetch('http://localhost:5001/upload/csv', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    };

    const handleFileSelect = (file) => {
        setUploadError('');
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setUploadError('Please select a CSV file');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadError('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-4">
                {/* File Upload Area */}
                {selectedFile && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    {selectedFile.name}
                                </span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {uploadError && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                        {uploadError}
                    </div>
                )}

                {/* Main Input Area */}
                <div 
                    className={`flex gap-2 p-3 rounded-lg border-2 border-dashed transition-colors ${
                        isDragOver 
                            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900' 
                            : selectedFile 
                                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* File Upload Button */}
                    <button
                        type="button"
                        onClick={handleBrowseClick}
                        disabled={isLoading || isUploading}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Upload CSV file"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </button>

                    {/* Text Input */}
                    <input
                        type="text"
                        placeholder={selectedFile ? "Ask about the uploaded CSV data..." : "Type your message or drag a CSV file here..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || isUploading}
                        className="flex-1 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={isLoading || isUploading || (!input.trim() && !selectedFile)}
                        className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                    >
                        {isLoading || isUploading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg
                                className="w-4 h-4"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 10">
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M1 5h12m0 0L9 1m4 4L9 9"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {/* Drag & Drop Hint */}
                {!selectedFile && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Drag and drop a CSV file here, or click the upload button
                    </div>
                )}
            </div>
        </form>
    );
}
