import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

/**
 * Creates and initializes the Hospital Agent using LangChain.
 * 
 * @param {Object} options - Tool handlers and API key.
 */
import { db } from "./database.js";
import { searchKnowledge, addMemory } from "./vectorStore.js";

/**
 * Creates and initializes the Hospital Agent using LangChain, Groq, and RAG.
 */
export async function initHospitalAgent({ apiKey }) {

    const tools = [
        new DynamicStructuredTool({
            name: "get_hospital_stats",
            description: "Returns hospital telemetry (occupancy, emergencies) from PostgreSQL.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(await db.getStats()),
        }),
        new DynamicStructuredTool({
            name: "search_operations_manual",
            description: "Retrieves hospital protocols and operational procedures from vector memory.",
            schema: z.object({
                query: z.string().describe("Emergency or operational query."),
            }),
            func: async ({ query }) => await searchKnowledge(query),
        }),
        new DynamicStructuredTool({
            name: "check_ward_beds",
            description: "Queries PostgreSQL for available beds in a specific ward.",
            schema: z.object({
                ward: z.string().describe("Ward name (ICU, General Ward)."),
            }),
            func: async ({ ward }) => `Ward ${ward} has ${await db.getBedAvailability(ward)} beds currently available.`,
        }),
        new DynamicStructuredTool({
            name: "log_emergency_event",
            description: "Logs critical medical events or alerts into the PostgreSQL audit log.",
            schema: z.object({
                event: z.string().describe("Type of event (CODE BLUE, Trauma Level 1, etc)."),
                location: z.string().describe("Ward or room number."),
            }),
            func: async ({ event, location }) => {
                await db.logAction("HospitalAgent", event, `Location: ${location}`);
                return `Alert for ${event} at ${location} logged in persistent storage.`;
            },
        }),
        new DynamicStructuredTool({
            name: "update_bed_registry",
            description: "Updates bed status in the PostgreSQL clinical registry.",
            schema: z.object({
                bedId: z.string().describe("Registry ID of the bed."),
                status: z.enum(["Available", "Occupied", "Maintenance"]),
            }),
            func: async ({ bedId, status }) => {
                await db.logAction("HospitalAgent", "BedUpdate", `Bed ${bedId} shifted to ${status}`);
                return `Bed registry record for #${bedId} updated.`;
            }
        })
    ];

    const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        maxRetries: 1,
        timeout: 15000,
    });

    const systemInstruction = `You are the SehatAI Hospital Operations Assistant. You manage St. Jude Medical Center using:
    1. **PostgreSQL**: For real-time bed registry and staff duty logs.
    2. **Vector Memory (RAG)**: For quick retrieval of emergency protocols (CODE BLUE, etc) via search_operations_manual.
    
    You assist hospital staff. Always prioritize accuracy and persistent logging of all events.
    
    IMPORTANT: If the user provides a simple greeting like 'hi', 'hello', or 'hey', do NOT use any tools. Simply reply with a warm, professional greeting.
    Reply in the user's language (English, Hindi, or Hinglish). Keep it sweet and concise.`;

    const agent = createReactAgent({
        llm,
        tools,
        stateModifier: systemInstruction,
    });

    return {
        invoke: async ({ input, chat_history = [] }) => {
            try {
                // Prune history to last 6 messages (3 turns) to save tokens
                const prunedHistory = chat_history.slice(-6);
                const langChainHistory = prunedHistory.map(msg => {
                    return msg[0] === "human" ? new HumanMessage(msg[1]) : new AIMessage(msg[1]);
                });

                const response = await agent.invoke({
                    messages: [
                        ...langChainHistory,
                        new HumanMessage(input)
                    ],
                }, {
                    recursionLimit: 15 // Increased from 5 to allow complex reasoning
                });

                const finalMsg = response.messages[response.messages.length - 1];
                return { output: finalMsg.content || "Hospital operations registry updated." };
            } catch (error) {
                console.error("Hospital Agent error:", error);
                return { output: `System error: ${error.message}` };
            }
        },
    };
}
