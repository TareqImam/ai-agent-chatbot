import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

export const geminiContentGenerate = async (req, res) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: req.body.prompt,
        });

        res.status(200).json({
            success: true,
            message: 'Product Stored',
            data: response.text
        })
    } catch (error) {
        console.log(error.message);
    }
}