import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("Fetching models...");
    try {
        const response = await ai.models.list();
        let models = [];
        // The SDK might return an async iterator or an array
        for await (const model of response) {
            models.push(model.name);
        }
        console.log("Available models:");
        console.log(models.filter(m => m.includes("flash")));
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}

run();
