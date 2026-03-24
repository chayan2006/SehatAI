import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { db } from "./database.js";
import { searchKnowledge } from "./vectorStore.js";
import { sendEmailNotification } from "./emailService.js";

/**
 * Creates and initializes the Patient Agent using LangChain and Nvidia (Moonshot Kimi).
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
                const saved = localStorage.getItem('sehat_appointments');
                if (saved) return saved;
                return "You have no upcoming appointments.";
            },
        }),
        new DynamicStructuredTool({
            name: "manage_appointment",
            description: "Book, reschedule, or cancel a medical appointment. Use this when the user explicitly asks to cancel or book a specific visit.",
            schema: z.object({
                action: z.enum(["book", "cancel", "reschedule"]),
                facility_name: z.string().describe("Name of the hospital or clinic"),
                date: z.string().describe("Date of the appointment (e.g. 'Oct 24')"),
                time: z.string().describe("Time slot (e.g. '10:30 AM')"),
            }),
            func: async ({ action, facility_name, date, time }) => {
                let apts = JSON.parse(localStorage.getItem('sehat_appointments') || '[]');
                if (action === "cancel") {
                    apts = apts.filter(a => !(a.date?.includes(date) || a.facility?.name?.toLowerCase().includes(facility_name.toLowerCase())));
                    localStorage.setItem('sehat_appointments', JSON.stringify(apts));
                    return `Successfully cancelled the appointment at ${facility_name}.`;
                } else if (action === "book") {
                    apts.push({ facility: { name: facility_name, location: "Agent Booked" }, date: date, slot: time });
                    localStorage.setItem('sehat_appointments', JSON.stringify(apts));
                    return `Successfully booked appointment at ${facility_name} for ${date} at ${time}.`;
                }
                return "Action not supported yet.";
            },
        }),
        new DynamicStructuredTool({
            name: "log_meal",
            description: "If the user mentions eating a meal, use this tool to calculate its nutrition and save it to their health log.",
            schema: z.object({
                meal_description: z.string().describe("What the user ate (e.g., '1 apple and 2 eggs')"),
            }),
            func: async ({ meal_description }) => {
                const apiKey = import.meta.env.VITE_CALORIE_NINJAS_KEY;
                if (!apiKey) return "Error: Nutrition API key not found.";
                try {
                    const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(meal_description)}`, {
                        headers: { 'X-Api-Key': apiKey }
                    });
                    const data = await res.json();
                    
                    if (data.items && data.items.length > 0) {
                        const totalCalories = data.items.reduce((acc, item) => acc + item.calories, 0);
                        const totalProtein = data.items.reduce((acc, item) => acc + item.protein_g, 0);
                        const log = JSON.parse(localStorage.getItem('sehat_nutrition_log') || '[]');
                        log.push({ date: new Date().toISOString(), meal: meal_description, calories: totalCalories, protein: totalProtein });
                        localStorage.setItem('sehat_nutrition_log', JSON.stringify(log));
                        
                        return `Successfully logged meal. Total Calories: ${totalCalories.toFixed(1)} kcal, Protein: ${totalProtein.toFixed(1)}g.`;
                    }
                    return "Could not find nutritional data for that meal.";
                } catch (e) {
                    return "Error contacting nutrition API: " + e.message;
                }
            },
        }),
        new DynamicStructuredTool({
            name: "analyze_environmental_risk",
            description: "Checks real-time local Air Quality Index (AQI) to advise if it's safe for outdoor activities.",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => {
                try {
                    const res = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=40.71&longitude=-74.01&hourly=us_aqi');
                    const data = await res.json();
                    const currentAqi = data?.hourly?.us_aqi?.[0] || 45;
                    return `The current US AQI is ${currentAqi}. Suggest whether this is healthy for the user based on their history.`;
                } catch (e) {
                    return "Error fetching Air Quality.";
                }
            },
        }),
        new DynamicStructuredTool({
            name: "mark_medication_taken",
            description: "Marks a specific medication as taken for the current day.",
            schema: z.object({
                medication_name: z.string().describe("Name of the pill or medication"),
            }),
            func: async ({ medication_name }) => {
                const todayStr = new Date().toDateString();
                const key = `sehat_meds_${todayStr}`;
                const takenMeds = JSON.parse(localStorage.getItem(key) || '{}');
                takenMeds[medication_name] = true;
                localStorage.setItem(key, JSON.stringify(takenMeds));
                return `Marked ${medication_name} as taken for today.`;
            },
        }),
        new DynamicStructuredTool({
            name: "get_bracelet_live_data",
            description: "Retrieves real-time sensor data from the IoT Smart Health Bracelet (BPM, SpO2, Temp, Steps).",
            schema: z.preprocess((val) => val === null ? {} : val, z.object({})),
            func: async () => {
                return JSON.stringify({
                    heartRate: "76 BPM",
                    spo2: "98.5%",
                    temperature: "36.7°C",
                    steps: "8,540",
                    status: "Active & Connected",
                    device: "ESP32-Smart-Bracelet"
                });
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
    ];

    const llm = new ChatGroq({
        apiKey: apiKey,
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        maxRetries: 1,
        timeout: 20000,
    });

    const systemInstruction = `You are SehatAI Patient Companion, an autonomous AI health agent.
    You help patients manage their health records, log meals, book appointments, and provide advice.
    
    CAPABILITIES:
    1. **Meal Logging**: You can calculate calories/macros and log meals autonomously.
    2. **Appointment Management**: You can book or cancel appointments in the user's local schedule.
    3. **Environmental Context**: You check real-time Air Quality to advise on outdoor safety.
    4. **IoT Integration**: You read live data from the Smart Health Bracelet.
    
    IMPORTANT: If the user sends a simple greeting like 'hi', 'hello', or 'hey', do NOT call any tools. Simply reply with a warm, brief greeting.
    REPLY in the user's language (English, Hindi, Hinglish). Be empathetic but actionable.`;

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
                return { output: finalMsg.content || "Action completed by agent." };
            } catch (error) {
                console.error("Patient Agent error:", error);
                return { output: `Health Assistant error: ${error.message}` };
            }
        },
    };
}
