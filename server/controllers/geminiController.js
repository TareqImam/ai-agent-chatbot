import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Temporary in-memory storage for testing
const tempSessions = new Map();
const tempMessages = new Map();

export const geminiContentGenerate = async (req, res) => {
    const requestTime = new Date();
    
    try {
        console.log('Received request:', { data: req.body.data, sessionId: req.body.sessionId });
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { data, sessionId } = req.body;
        
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'Message data is required'
            });
        }
        
        // Generate session ID if not provided
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            currentSessionId = uuidv4();
            console.log('Created new session:', currentSessionId);
            tempSessions.set(currentSessionId, {
                sessionId: currentSessionId,
                messageCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Get or create session
        let session = tempSessions.get(currentSessionId);
        if (!session) {
            console.log('Creating new session for existing ID:', currentSessionId);
            session = {
                sessionId: currentSessionId,
                messageCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            tempSessions.set(currentSessionId, session);
        }

        console.log('Saving user message...');
        // Save user message
        const userMessage = {
            id: uuidv4(),
            sessionId: currentSessionId,
            role: 'user',
            content: data,
            timestamp: requestTime,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male'
        };

        if (!tempMessages.has(currentSessionId)) {
            tempMessages.set(currentSessionId, []);
        }
        tempMessages.get(currentSessionId).push(userMessage);

        console.log('Generating AI response...');
        // Generate AI response
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: data,
        });
        const responseTime = new Date();

        console.log('Saving bot message...');
        // Save bot message
        const botMessage = {
            id: uuidv4(),
            sessionId: currentSessionId,
            role: 'bot',
            content: response.text,
            timestamp: responseTime,
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot'
        };

        tempMessages.get(currentSessionId).push(botMessage);

        // Update session message count
        session.messageCount += 2;
        session.updatedAt = new Date();

        // Get full chat history for this session
        const chatHistory = tempMessages.get(currentSessionId) || [];

        console.log('Sending response with', chatHistory.length, 'messages');

        res.status(200).json({
            success: true,
            message: 'Message processed successfully',
            data: {
                sessionId: currentSessionId,
                chatHistory: chatHistory
            },
        });
    } catch (error) {
        console.error('Error in geminiContentGenerate:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message,
        });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        const chatHistory = tempMessages.get(sessionId) || [];

        res.status(200).json({
            success: true,
            data: {
                sessionId,
                chatHistory
            }
        });
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat history',
            error: error.message,
        });
    }
};

export const createNewChat = async (req, res) => {
    try {
        const newSessionId = uuidv4();
        
        tempSessions.set(newSessionId, {
            sessionId: newSessionId,
            messageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        tempMessages.set(newSessionId, []);

        res.status(200).json({
            success: true,
            data: {
                sessionId: newSessionId,
                chatHistory: []
            }
        });
    } catch (error) {
        console.error('Error in createNewChat:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating new chat',
            error: error.message,
        });
    }
};
