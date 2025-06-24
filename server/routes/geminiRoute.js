import express from 'express';
import { geminiContentGenerate, getChatHistory, createNewChat } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/', geminiContentGenerate);
router.get('/history/:sessionId', getChatHistory);
router.post('/new-chat', createNewChat);

export default router;
