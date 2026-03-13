import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";

/**
 * Creates and initializes the Admin Agent using LangChain.
 * 
 * @param {Object} options - Tool handlers and API key.
 */
import { db } from "./database.js";
import { searchKnowledge, addMemory } from "./vectorStore.js";

/**
 * Creates and initializes the Admin Agent using LangChain, Groq, and Persistent Memory.
 */
export async function initAdminAgent({ apiKey }) {

    const tools = [
        new DynamicStructuredTool({
            name: "get_system_stats",
            description: "Returns current system telemetry from PostgreSQL.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(await db.getStats()),
        }),
        new DynamicStructuredTool({
            name: "search_knowledge_memory",
            description: "Queries the vector database for hospital protocols, policies, and historical context.",
            schema: z.object({
                query: z.string().describe("The search term for knowledge retrieval."),
            }),
            func: async ({ query }) => await searchKnowledge(query),
        }),
        new DynamicStructuredTool({
            name: "add_to_knowledge_memory",
            description: "Adds new clinical notes or hospital updates to the long-term vector memory.",
            schema: z.object({
                content: z.string().describe("The information to remember."),
            }),
            func: async ({ content }) => {
                await addMemory(content);
                return "Memory successfully stored across vector network.";
            },
        }),
        new DynamicStructuredTool({
            name: "get_patient_records",
            description: "Retrieves all patient records from the PostgreSQL database.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(await db.getPatients()),
        }),
        new DynamicStructuredTool({
            name: "update_patient_status",
            description: "Updates a patient's clinical status in PostgreSQL.",
            schema: z.object({
                patientId: z.string().describe("The unique ID of the patient."),
                status: z.string().describe("The new health status."),
            }),
            func: async ({ patientId, status }) => {
                await db.updatePatientStatus(patientId, status);
                return `Patient ${patientId} status updated to ${status} in PostgreSQL.`;
            },
        }),
        new DynamicStructuredTool({
            name: "check_bed_availability",
            description: "Checks real-time bed counts from the PostgreSQL 'beds' table.",
            schema: z.object({
                ward: z.string().describe("Ward name (ICU, General, etc.)."),
            }),
            func: async ({ ward }) => `Available beds in ${ward}: ${await db.getBedAvailability(ward)}`,
        }),
        new DynamicStructuredTool({
            name: "query_inventory",
            description: "Queries pharmaceutical and supply inventory from PostgreSQL.",
            schema: z.object({
                item: z.string().describe("Item name to search for."),
            }),
            func: async ({ item }) => JSON.stringify(await db.getInventory(item)),
        }),
        new DynamicStructuredTool({
            name: "log_system_action",
            description: "Logs administrative actions for audit trails in PostgreSQL.",
            schema: z.object({
                action: z.string().describe("The action performed."),
                details: z.string().optional().describe("Additional context."),
            }),
            func: async ({ action, details }) => {
                await db.logAction("AdminAgent", action, details || "No extra data");
                return "Action logged in PostgreSQL audit table.";
            },
        }),
    ];

    const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0.1, // Lower temperature for more structured retrieval
        maxRetries: 1,
        timeout: 15000,
    });

    const systemInstruction = `You are the SehatAI Admin Agent, a state-of-the-art AI built on LangChain and Groq.
    You have deep integration with:
    1. **PostgreSQL**: For persistent data like patients, beds, and inventory.
    2. **Vector Memory (RAG)**: Using tools like search_knowledge_memory and add_to_knowledge_memory to store/retrieve hospital protocols and context.
    
    You assist Dr. Sarah Jenkins. Always use your memory search if you are unsure about hospital policy. Keep responses professional, and intimately context-aware. 
    
    IMPORTANT: If the user provides a simple greeting like 'hi', 'hello', or 'hey', do NOT use any tools. Simply reply with a warm, professional greeting.
    Reply in the user's language (English, Hindi, or Hinglish). Use English alphabet for Hinglish.`;

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
                console.log("AgentExecutor: LangGraph agent finished.");

                const finalMsg = response.messages[response.messages.length - 1];
                return { output: finalMsg.content || "Processed by SehatAI Agentic Engine." };
            } catch (error) {
                console.error("Admin Agent error:", error);
                return { output: `Agent connection error: ${error.message}` };
            }
        },
    };
}
