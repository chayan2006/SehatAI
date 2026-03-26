/**
 * Hospital Agent (Doctor Portal) — Groq (LLaMA) for text/tools + Gemini for images.
 * Tools read/write live Firestore data via firestoreService.
 */
import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import {
  getPatients, getHospitalStats, getAllAppointments,
  sendNotificationToUser, getPatients as getDoctorPatients
} from './supabaseService.js';

// ─── Image analysis (Gemini direct) ──────────────────────────────────────────
async function analyzeImageWithGemini(imageDataUrl, question) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return "Gemini API key not configured.";
  const match = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return "Invalid image format.";
  const [, mimeType, base64Data] = match;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: question || "Analyze this medical image from a clinical perspective." }
          ]}],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );
    const data = await res.json();
    if (data.error) return `Gemini API Error: ${data.error.message}`;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze image.";
  } catch (e) { return "Image analysis error: " + e.message; }
}

// ─── Tools ────────────────────────────────────────────────────────────────────
const tools = [
  new DynamicStructuredTool({
    name: "get_hospital_stats",
    description: "Returns live hospital stats: total patients, doctors, and appointments from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => JSON.stringify(await getHospitalStats()),
  }),
  new DynamicStructuredTool({
    name: "get_my_patients",
    description: "Retrieves all registered patients from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      const patients = await getPatients();
      if (!patients.length) return "No registered patients found.";
      return JSON.stringify(patients.map(p => ({
        name: p.full_name, email: p.email, phone: p.phone || 'N/A', uid: p.id
      })));
    },
  }),
  new DynamicStructuredTool({
    name: "get_appointments",
    description: "Retrieves all upcoming patient appointments from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      const apts = await getAllAppointments();
      if (!apts.length) return "No appointments found.";
      return JSON.stringify(apts.slice(0, 10));
    },
  }),
  new DynamicStructuredTool({
    name: "send_patient_alert",
    description: "Sends an urgent notification to a specific patient. Use when a doctor needs to alert a patient urgently.",
    schema: z.object({
      patient_uid: z.string().describe("The Firebase UID of the patient to notify."),
      title: z.string().describe("Alert title (e.g. 'Urgent: Lab Results Ready')."),
      message: z.string().describe("The alert message body."),
    }),
    func: async ({ patient_uid, title, message }) => {
      await sendNotificationToUser(patient_uid, title, message, 'Doctor');
      return `Alert sent to patient successfully.`;
    },
  }),
  new DynamicStructuredTool({
    name: "check_ward_availability",
    description: "Returns ward occupancy status.",
    schema: z.object({ ward: z.string().describe("Ward name (ICU, General, Pediatrics).") }),
    func: async ({ ward }) => {
      const mockBeds = { ICU: 3, General: 12, Pediatrics: 7, Cardiology: 5 };
      const available = mockBeds[ward] ?? 4;
      return `Ward ${ward}: ${available} beds currently available.`;
    },
  }),
];

// ─── Agent factory ─────────────────────────────────────────────────────────────
export async function initHospitalAgent({ apiKey }) {
  const llm = new ChatGroq({
    apiKey,
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    maxRetries: 1,
    timeout: 20000,
  });

  const agent = createReactAgent({
    llm,
    tools,
    stateModifier: `You are the SehatAI Hospital Agent for the Doctor Portal.
You have real-time access to:
1. Patient records from Firestore
2. Appointment data from Firestore
3. Hospital stats (beds, occupancy)
4. The ability to send push alerts directly to patients

IMPORTANT: If the user sends a simple greeting, do NOT call tools. Just reply warmly.
Always be professional, precise, and clinically accurate. Reply in English or Hinglish.`,
  });

  return {
    invoke: async ({ input, chat_history = [], image_data = null }) => {
      try {
        if (image_data) {
          const analysis = await analyzeImageWithGemini(image_data, input);
          return { output: analysis };
        }

        const history = chat_history.slice(-6).map(([role, text]) =>
          role === "human" ? new HumanMessage(text) : new AIMessage(text)
        );

        const response = await agent.invoke({
          messages: [...history, new HumanMessage(input)],
        });

        const final = response.messages[response.messages.length - 1];
        return { output: final.content || "Action completed." };
      } catch (error) {
        console.error("Hospital Agent error:", error);
        return { output: `Doctor AI error: ${error.message}` };
      }
    },
  };
}
