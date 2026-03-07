import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function run() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    try {
        let response = await chat.sendMessage({ message: "what is the weather?" });
        console.log("Model wants to call:", JSON.stringify(response.functionCalls, null, 2));

        const toolResponses = [];
        for (const call of response.functionCalls || []) {
            toolResponses.push({
                functionResponse: {
                    name: call.name,
                    response: { weather: "Sunny, 75 degrees" }
                }
            });
        }

        console.log("Sending back:", JSON.stringify(toolResponses, null, 2));
        // Try passing it as message or how?
        let response2 = await chat.sendMessage({ message: toolResponses });
        console.log("Final response:", response2.text);
    } catch (error) {
        console.error("Error during second sendMessage:", error);
    }
}

run();
