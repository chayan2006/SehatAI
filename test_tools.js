import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log("Initializing chat...");
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

    console.log("Sending message to force tool use 'what is the weather?'...");
    try {
        let response = await chat.sendMessage({ message: "what is the weather?" });
        console.log("Response text:", response.text);
        console.log("Function calls type:", typeof response.functionCalls);
        console.log("Function calls object:", JSON.stringify(response.functionCalls, null, 2));

        // Also log the raw structure just in case it's named something else
        console.log("Full response keys:", Object.keys(response));
        console.log("Candidates:", JSON.stringify(response.candidates, null, 2));
    } catch (error) {
        console.error("Error during sendMessage:", error);
    }
}

run();
