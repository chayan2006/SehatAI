import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("Initializing chat with models/gemini-2.5-flash...");
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: "You are a helpful assistant.",
            tools: [{
                functionDeclarations: [
                    {
                        name: "get_weather",
                        description: "Get the current weather",
                        parameters: { type: "OBJECT", properties: {} },
                    }
                ]
            }],
        }
    });

    console.log("Sending message 'hi'...");
    try {
        let response = await chat.sendMessage({ message: "hi" });
        console.log("Response text type:", typeof response.text);
        if (typeof response.text === 'function') {
            console.log("Response text():", response.text());
        } else {
            console.log("Response text:", response.text);
        }

        console.log("Function calls type:", typeof response.functionCalls);
        console.log("Function calls length:", response.functionCalls?.length);
    } catch (error) {
        console.error("Error during sendMessage:", error);
    }
}

run();
