import express from 'express';
import { geminiContentGenerate, getChatHistory, createNewChat, getAllSessions, deleteSession } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/', geminiContentGenerate);
router.get('/history/:sessionId', getChatHistory);
router.post('/new-chat', createNewChat);
router.get('/sessions', getAllSessions);
router.delete('/sessions/:sessionId', deleteSession);

export default router;
