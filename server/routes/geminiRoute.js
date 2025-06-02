import express from 'express';
import { geminiContentGenerate } from '../controllers/geminiController.js';

const router = express.Router();

router.post('/', geminiContentGenerate);

export default router;
