import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Temporary in-memory storage for testing
const tempSessions = new Map();
const tempMessages = new Map();
const tempCSVData = new Map(); // Store CSV data for each session

export const geminiContentGenerate = async (req, res) => {
    const requestTime = new Date();
    
    try {
        console.log('Received request:', { 
            displayMessage: req.body.displayMessage, 
            fullMessage: req.body.fullMessage, 
            sessionId: req.body.sessionId 
        });
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { displayMessage, fullMessage, sessionId } = req.body;
        
        // Use fullMessage if provided (for CSV uploads), otherwise use displayMessage
        const messageToProcess = fullMessage || displayMessage;
        const messageToDisplay = displayMessage || fullMessage;
        
        if (!messageToProcess) {
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

        // Get existing chat history for this session
        const existingMessages = tempMessages.get(currentSessionId) || [];
        console.log('Existing messages in session:', existingMessages.length);

        // Check if this message contains CSV data and store it
        if (fullMessage && fullMessage.includes('I\'ve uploaded a CSV file:')) {
            tempCSVData.set(currentSessionId, fullMessage);
            console.log('Stored CSV data for session:', currentSessionId);
        }

        console.log('Saving user message...');
        // Save user message (only the display message, not the full message with CSV data)
        const userMessage = {
            id: uuidv4(),
            sessionId: currentSessionId,
            role: 'user',
            content: messageToDisplay, // Store only what should be displayed
            timestamp: requestTime,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male'
        };

        // Add user message to history
        existingMessages.push(userMessage);
        tempMessages.set(currentSessionId, existingMessages);

        console.log('Generating AI response with chat history...');
        
        // Prepare conversation history for Gemini API
        const conversationHistory = [];
        
        // Get stored CSV data for this session
        const storedCSVData = tempCSVData.get(currentSessionId);
        
        console.log('Session ID:', currentSessionId);
        console.log('Stored CSV data exists:', !!storedCSVData);
        console.log('Existing messages count:', existingMessages.length);
        
        // Always include CSV data as context if it exists (not just for first message)
        if (storedCSVData) {
            console.log('Including CSV data in conversation history');
            conversationHistory.push({
                role: 'user',
                parts: [{ text: storedCSVData }]
            });
        }
        
        // Add all previous messages (both user and bot)
        for (let i = 0; i < existingMessages.length - 1; i++) {
            const msg = existingMessages[i];
            console.log(`Adding message ${i}:`, msg.role, msg.content.substring(0, 50) + '...');
            conversationHistory.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }
        
        // For the current message, if we have CSV data stored, send only the user's question
        // If no CSV data is stored, send the full message
        const currentMessageText = storedCSVData ? messageToDisplay : messageToProcess;
        
        // Add the current message
        conversationHistory.push({
            role: 'user',
            parts: [{ text: currentMessageText }]
        });

        console.log('Sending conversation history to Gemini:', conversationHistory.length, 'messages');
        console.log('Current message being sent:', currentMessageText);
        console.log('Full conversation history:', JSON.stringify(conversationHistory, null, 2));
        
        // Generate AI response with full conversation history
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: conversationHistory,
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

        // Add bot message to history
        existingMessages.push(botMessage);
        tempMessages.set(currentSessionId, existingMessages);

        // Update session message count
        session.messageCount += 2;
        session.updatedAt = new Date();

        console.log('Sending response with', existingMessages.length, 'messages');

        res.status(200).json({
            success: true,
            message: 'Message processed successfully',
            data: {
                sessionId: currentSessionId,
                chatHistory: existingMessages
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
        tempCSVData.delete(newSessionId); // Clear any existing CSV data

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

export const getAllSessions = async (req, res) => {
    try {
        const sessions = Array.from(tempSessions.values()).map(session => {
            const messages = tempMessages.get(session.sessionId) || [];
            const lastMessage = messages[messages.length - 1];
            
            return {
                sessionId: session.sessionId,
                messageCount: session.messageCount,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                lastMessage: lastMessage ? {
                    content: lastMessage.content.substring(0, 100) + (lastMessage.content.length > 100 ? '...' : ''),
                    timestamp: lastMessage.timestamp,
                    role: lastMessage.role
                } : null
            };
        }).sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return dateB - dateA;
        });

        res.status(200).json({
            success: true,
            data: {
                sessions
            }
        });
    } catch (error) {
        console.error('Error in getAllSessions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions',
            error: error.message,
        });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required'
            });
        }

        // Remove session and its messages
        tempSessions.delete(sessionId);
        tempMessages.delete(sessionId);
        tempCSVData.delete(sessionId); // Clear CSV data for this session

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteSession:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting session',
            error: error.message,
        });
    }
};
