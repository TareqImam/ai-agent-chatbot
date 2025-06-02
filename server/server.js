import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import geminiRoute from './routes/geminiRoute.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', geminiRoute);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
