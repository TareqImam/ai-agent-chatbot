import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    messageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('ChatSession', chatSessionSchema); 