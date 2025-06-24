import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-chatbot';
        console.log('Connecting to MongoDB at:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
        
        const conn = await mongoose.connect(mongoUri);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        console.error('Full error:', error);
        throw error;
    }
};

export default connectDB; 