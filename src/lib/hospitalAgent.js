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
export async function initHospitalAgent({ apiKey, handlers }) {

    const tools = [
        new DynamicStructuredTool({
            name: "get_hospital_stats",
            description: "Returns hospital telemetry like occupancy rate, active emergencies, and bed availability.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(handlers.getStats()),
        }),
        new DynamicStructuredTool({
            name: "get_ward_status",
            description: "Returns the status of beds in a specific ward (ICU or General Ward).",
            schema: z.object({
                ward: z.enum(["ICU", "General Ward"]).describe("The ward to check."),
            }),
            func: async ({ ward }) => JSON.stringify(handlers.getWardStatus(ward)),
        }),
        new DynamicStructuredTool({
            name: "manage_bed",
            description: "Updates a bed's status (Available, Occupied, Maintenance) and assigns patients.",
            schema: z.object({
                bedId: z.string().describe("The ID of the bed (e.g., '101', 'ICU-1')."),
                status: z.enum(["Available", "Occupied", "Maintenance"]).describe("New status."),
                patient: z.string().optional().describe("Patient name if status is Occupied."),
            }),
            func: async (params) => {
                handlers.manageBed(params);
                return JSON.stringify({ status: "Bed updated successfully" });
            },
        }),
        new DynamicStructuredTool({
            name: "get_staff_on_duty",
            description: "Returns a list of staff members currently on duty.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(handlers.getStaff()),
        }),
        new DynamicStructuredTool({
            name: "get_emergency_alerts",
            description: "Returns information about active emergency alerts (e.g., CODE BLUE).",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(handlers.getEmergencies()),
        }),
        new DynamicStructuredTool({
            name: "send_page",
            description: "Sends an urgent page or alert message to a specific staff member or department.",
            schema: z.object({
                message: z.string().describe("The alert message."),
                recipient: z.string().describe("Who should receive the alert."),
            }),
            func: async ({ message, recipient }) => String(handlers.sendPage(message, recipient)),
        })
    ];

    const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        maxRetries: 1,
        timeout: 15000,
    });

    const systemInstruction = `You are the SehatAI Hospital Operations Assistant. You help hospital staff manage day-to-day operations at St. Jude Medical Center. 
    You have access to real-time data about bed occupancy, staff duty rosters, and emergency alerts.
    You can check stats (get_hospital_stats), see ward maps (get_ward_status), update bed assignments (manage_bed), check staff (get_staff_on_duty), and monitor emergencies (get_emergency_alerts).
    Always be professional, concise, and helpful.
    
    IMPORTANT LANGUAGE INSTRUCTION: You must reply in the exact same language the user speaks to you. If the user speaks in English, reply in English. If the user speaks in Hindi, reply in authentic Hindi. If the user speaks in "Hinglish" (Hindi words in English script), reply back in fluent Hinglish. Sound helpful and sweet. Keep sentences short for TTS.`;

    const agent = createReactAgent({
        llm,
        tools,
        stateModifier: systemInstruction,
    });

    return {
        invoke: async ({ input, chat_history = [] }) => {
            try {
                const langChainHistory = chat_history.map(msg => {
                    return msg[0] === "human" ? new HumanMessage(msg[1]) : new AIMessage(msg[1]);
                });

                const response = await agent.invoke({
                    messages: [
                        ...langChainHistory,
                        new HumanMessage(input)
                    ],
                });

                const finalMsg = response.messages[response.messages.length - 1];
                return { output: finalMsg.content || "I've processed your request." };
            } catch (error) {
                console.error("Hospital Agent error:", error);
                return { output: `Error: ${error.message || JSON.stringify(error)}` };
            }
        },
    };
}
