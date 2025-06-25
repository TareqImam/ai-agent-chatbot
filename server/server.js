import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import geminiRoute from './routes/geminiRoute.js';
import uploadRoute from './routes/uploadRoute.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/gemini', geminiRoute);
app.use('/upload', uploadRoute);

const PORT = process.env.PORT || 5001;

// Start server without MongoDB for testing
const startServer = async () => {
    try {
        console.log('Starting server without MongoDB (using in-memory storage)...');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`API available at http://localhost:${PORT}/gemini`);
            console.log(`Upload API available at http://localhost:${PORT}/upload`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
