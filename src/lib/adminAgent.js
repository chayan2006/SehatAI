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
export async function initAdminAgent({ apiKey, handlers }) {

    const tools = [
        new DynamicStructuredTool({
            name: "get_system_stats",
            description: "Returns current system telemetry like patient count, throughput, and security status.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(handlers.getStats()),
        }),
        new DynamicStructuredTool({
            name: "get_escalations",
            description: "Returns the list of active and resolved escalations.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => JSON.stringify(handlers.getEscalations()),
        }),
        new DynamicStructuredTool({
            name: "resolve_escalation",
            description: "Resolves a specific risk escalation by its ID (e.g., #PX-8812).",
            schema: z.object({
                id: z.string().describe("The ID of the escalation to resolve."),
            }),
            func: async ({ id }) => JSON.stringify({ status: handlers.resolveEscalation(id) ? "Success" : "Failed" }),
        }),
        new DynamicStructuredTool({
            name: "update_profile",
            description: "Updates the admin's professional profile information.",
            schema: z.object({
                role: z.string().optional().describe("New professional role."),
                email: z.string().optional().describe("New email address."),
                phone: z.string().optional().describe("New phone number."),
            }),
            func: async (params) => {
                handlers.updateProfile(params);
                return JSON.stringify({ status: "Profile updated" });
            },
        }),
        new DynamicStructuredTool({
            name: "export_report",
            description: "Triggers a PDF report export of the current dashboard data.",
            schema: z.object({
                view: z.enum(["dashboard", "patients", "agents", "escalations"]).describe("The specific view to export."),
            }),
            func: async ({ view }) => {
                handlers.exportReport(view);
                return JSON.stringify({ status: `Exporting ${view} report.` });
            },
        }),
        new DynamicStructuredTool({
            name: "search_telemetry",
            description: "Filters the dashboard data based on a search query.",
            schema: z.object({
                query: z.string().describe("The search term for patients, risks, or agents."),
            }),
            func: async ({ query }) => {
                handlers.setSearchQuery(query);
                return JSON.stringify({ status: `Searching for ${query}` });
            },
        }),
        // Resource & Facility Management
        new DynamicStructuredTool({
            name: "check_bed_availability",
            description: "Check the availability of beds in a specific ward or overall.",
            schema: z.object({
                ward: z.enum(["ICU", "ER", "General", "Maternity"]).describe("The ward to check.")
            }),
            func: async ({ ward }) => String(handlers.checkBedAvailability(ward)),
        }),
        new DynamicStructuredTool({
            name: "check_inventory",
            description: "Check inventory levels for critical supplies.",
            schema: z.object({
                item: z.string().describe("The item to check (e.g., 'Oxygen', 'O-Negative Blood').")
            }),
            func: async ({ item }) => String(handlers.checkInventory(item)),
        }),
        new DynamicStructuredTool({
            name: "order_supplies",
            description: "Create an order for medical supplies.",
            schema: z.object({
                item: z.string().describe("The item to order."),
                quantity: z.number().describe("The amount to order.")
            }),
            func: async ({ item, quantity }) => String(handlers.orderSupplies(item, quantity)),
        }),
        // Staff & Agent Coordination
        new DynamicStructuredTool({
            name: "get_staff_roster",
            description: "Get the current staff roster or find a specific specialist.",
            schema: z.object({
                department: z.string().describe("The department to check (e.g., 'Cardiology', 'ER').")
            }),
            func: async ({ department }) => String(handlers.getStaffRoster(department)),
        }),
        new DynamicStructuredTool({
            name: "assign_agent",
            description: "Assign a staff member to a specific task or location.",
            schema: z.object({
                agentName: z.string().describe("Name of the agent."),
                assignment: z.string().describe("The specific assignment or ward.")
            }),
            func: async ({ agentName, assignment }) => String(handlers.assignAgent(agentName, assignment)),
        }),
        new DynamicStructuredTool({
            name: "send_urgent_alert",
            description: "Send an urgent page or alert to staff.",
            schema: z.object({
                message: z.string().describe("The alert message."),
                recipient: z.string().describe("Who should receive the alert.")
            }),
            func: async ({ message, recipient }) => String(handlers.sendUrgentAlert(message, recipient)),
        }),
        // Advanced Patient & Record Actions
        new DynamicStructuredTool({
            name: "get_patient_summary",
            description: "Get a summary of a patient's status by ID.",
            schema: z.object({
                patientId: z.string().describe("The ID of the patient (e.g., 'PT-1042').")
            }),
            func: async ({ patientId }) => String(handlers.getPatientSummary(patientId)),
        }),
        new DynamicStructuredTool({
            name: "schedule_appointment",
            description: "Schedule a follow-up appointment for a patient.",
            schema: z.object({
                patientId: z.string().describe("The patient ID."),
                doctor: z.string().describe("The doctor's name."),
                date: z.string().describe("Date and time of the appointment.")
            }),
            func: async ({ patientId, doctor, date }) => String(handlers.scheduleAppointment(patientId, doctor, date)),
        }),
        new DynamicStructuredTool({
            name: "update_patient_status",
            description: "Update the status of a patient.",
            schema: z.object({
                patientId: z.string().describe("The patient ID."),
                status: z.enum(["Admitted", "In Surgery", "Recovery", "Discharged"]).describe("The new status.")
            }),
            func: async ({ patientId, status }) => String(handlers.updatePatientStatus(patientId, status)),
        }),
        // Predictive Analytics & Insights
        new DynamicStructuredTool({
            name: "analyze_bottlenecks",
            description: "Analyze current system data for throughput bottlenecks.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => String(handlers.analyzeBottlenecks()),
        }),
        new DynamicStructuredTool({
            name: "generate_shift_summary",
            description: "Generate a summary of the current shift's activities.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => String(handlers.generateShiftSummary()),
        }),
        // System Controls
        new DynamicStructuredTool({
            name: "toggle_maintenance",
            description: "Turn maintenance mode on or off for specific systems.",
            schema: z.object({
                system: z.enum(["Patient Booking Portal", "Internal API", "Database"]).describe("The system to toggle."),
                duration: z.number().describe("Duration in minutes.")
            }),
            func: async ({ system, duration }) => String(handlers.toggleMaintenance(system, duration)),
        }),
        new DynamicStructuredTool({
            name: "manage_permissions",
            description: "Grant or revoke access permissions for managing users.",
            schema: z.object({
                user: z.string().describe("The user to modify."),
                role: z.string().describe("The new role or permission level.")
            }),
            func: async ({ user, role }) => String(handlers.managePermissions(user, role)),
        })
    ];

    const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        maxRetries: 1,
        timeout: 15000,
    });

    const systemInstruction = `You are the SehatAI Admin Assistant for the SehatAI portal. You help Dr. Sarah Jenkins manage the hospital. You can monitor metrics (get_system_stats), resolve risks (resolve_escalation), update profiles (update_profile), export reports (export_report), filter data (search_telemetry), manage resources (check_bed_availability, check_inventory, order_supplies), coordinate staff (get_staff_roster, assign_agent, send_urgent_alert), manage patients (get_patient_summary, schedule_appointment, update_patient_status), analyze data (analyze_bottlenecks, generate_shift_summary), and control the system (toggle_maintenance, manage_permissions). Always be professional, concise, and confirm external actions to the user.
    
    IMPORTANT LANGUAGE INSTRUCTION: You must reply in the exact same language the user speaks to you. If the user speaks in English, reply in English. If the user speaks in Hindi, reply in authentic Hindi. If the user speaks in "Hinglish" (a mix of Hindi words written in English alphabet, e.g. "Hospital mein kitne beds khali hain?"), you MUST intimately reply back in fluent Hinglish using the English alphabet. Always sound helpful, sweet, and professional. Keep your sentences short so the text-to-speech engine speaks normally.`;

    const agent = createReactAgent({
        llm,
        tools,
        stateModifier: systemInstruction,
    });

    return {
        invoke: async ({ input, chat_history = [] }) => {
            try {
                // Map the string tuples from AdminDashboard.jsx into LangChain format
                const langChainHistory = chat_history.map(msg => {
                    return msg[0] === "human" ? new HumanMessage(msg[1]) : new AIMessage(msg[1]);
                });

                const response = await agent.invoke({
                    messages: [
                        ...langChainHistory,
                        new HumanMessage(input)
                    ],
                });

                // The last message from the agent should be the string response
                const finalMsg = response.messages[response.messages.length - 1];

                return { output: finalMsg.content || "I've completed the action." };
            } catch (error) {
                console.error("Agent error:", error);
                return { output: `Error: ${error.message || JSON.stringify(error)}` };
            }
        },
    };
}
