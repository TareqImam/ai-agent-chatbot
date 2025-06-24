import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

export default mongoose.model('Message', messageSchema); 