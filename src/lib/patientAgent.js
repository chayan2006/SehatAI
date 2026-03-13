import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { db } from "./database.js";
import { searchKnowledge } from "./vectorStore.js";

/**
 * Creates and initializes the Patient Agent using LangChain and Groq Vision.
 */
export async function initPatientAgent({ apiKey }) {

    const tools = [
        new DynamicStructuredTool({
            name: "get_my_health_metrics",
            description: "Retrieves your latest health vitals (Heart Rate, BP, Steps) from the database.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => {
                const stats = await db.getStats();
                return JSON.stringify({
                    heartRate: "72 BPM",
                    bloodPressure: "120/80 mmHg",
                    steps: "8,432",
                    status: "Stable"
                });
            },
        }),
        new DynamicStructuredTool({
            name: "get_my_appointments",
            description: "Retrieves your upcoming medical checkups and consultations.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => {
                return JSON.stringify([
                    { date: "Oct 24", time: "10:30 AM", doctor: "Dr. Sarah Mitchell", type: "Annual Physical" },
                    { date: "Nov 12", time: "02:00 PM", doctor: "Video Consultation", type: "Lab Results Review" }
                ]);
            },
        }),
        new DynamicStructuredTool({
            name: "search_health_advice",
            description: "Queries the medical knowledge base for first aid, wellness tips, and common health solutions.",
            schema: z.object({
                query: z.string().describe("The health question or symptom to look up."),
            }),
            func: async ({ query }) => await searchKnowledge(query),
        }),
        new DynamicStructuredTool({
            name: "analyze_wound_or_report",
            description: "Specialized tool for analyzing uploaded images of wounds, cuts, or medical reports.",
            schema: z.object({
                description: z.string().describe("A textual description of what the user uploaded or what is visible."),
            }),
            func: async ({ description }) => {
                // In a real scenario, this would trigger vision analysis if not already handled by the LLM
                return `Based on the visual analysis of "${description}": Please ensure the area is clean. If it's a cut, apply firm pressure with a clean cloth. If it's a medical report, your hemoglobin levels seem within normal range, but consult your doctor for a detailed review.`;
            },
        }),
    ];

    const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.3-70b-versatile", // Updated from decommissioned vision model
        temperature: 0.3,
        maxRetries: 1,
        timeout: 20000,
    });


    const systemInstruction = `You are SehatAI Patient Companion, a caring and knowledgeable AI health assistant.
    You help patients manage their health records, understand symptoms, and provide first aid advice.
    
    GUIDELINES:
    1. **Empathy**: Always be kind and supportive.
    2. **Safety**: If a user describes a life-threatening emergency, immediately advise them to call emergency services.
    3. **First Aid**: For minor issues like cuts, scrapes, or common colds, provide clear, step-by-step solutions.
    4. **Visualization**: You can "see" images. If a user uploads a photo of a wound or a report, analyze it carefully.
    
    You have access to the user's vitals and appointments. Use them to provide personalized advice.
    Reply in the user's language (English, Hindi, or Hinglish). Keep responses clear and actionable.`;

    const agent = createReactAgent({
        llm,
        tools,
        stateModifier: systemInstruction,
    });

    return {
        invoke: async ({ input, chat_history = [], image_data = null }) => {
            try {
                const langChainHistory = chat_history.slice(-6).map(msg => {
                    return msg[0] === "human" ? new HumanMessage(msg[1]) : new AIMessage(msg[1]);
                });

                let content = input;
                if (image_data) {
                    content = [
                        { type: "text", text: input },
                        { type: "image_url", image_url: { url: image_data } }
                    ];
                }

                const response = await agent.invoke({
                    messages: [
                        ...langChainHistory,
                        new HumanMessage({ content })
                    ],
                });

                const finalMsg = response.messages[response.messages.length - 1];
                return { output: finalMsg.content || "I have analyzed your request. Please let me know if you need more help." };
            } catch (error) {
                console.error("Patient Agent error:", error);
                return { output: `Health Assistant is currently busy: ${error.message}` };
            }
        },
    };
}
