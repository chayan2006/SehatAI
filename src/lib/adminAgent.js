/**
 * Admin Agent — Groq (LLaMA) for text/tools + Gemini for images.
 * Has the widest access: all users, appointments, and system-wide broadcasts.
 */
import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import {
  getAllUsers, getHospitalStats, getAllAppointments,
  sendNotificationToUser, getPatients, getDoctors
} from './firestoreService.js';

// ─── Image analysis (Gemini direct) ──────────────────────────────────────────
async function analyzeImageWithGemini(imageDataUrl, question) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return "Gemini API key not configured.";
  const match = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return "Invalid image format.";
  const [, mimeType, base64Data] = match;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: mimeType, data: base64Data } },
            { text: question || "Analyze this document or image." }
          ]}],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      }
    );
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze.";
  } catch (e) { return "Analysis error: " + e.message; }
}

// ─── Tools ────────────────────────────────────────────────────────────────────
const tools = [
  new DynamicStructuredTool({
    name: "get_system_stats",
    description: "Returns live system-wide stats: total patients, doctors, and appointments.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => JSON.stringify(await getHospitalStats()),
  }),
  new DynamicStructuredTool({
    name: "get_all_users",
    description: "Retrieves ALL registered users (patients, doctors, admins) from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      const users = await getAllUsers();
      return JSON.stringify(users.map(u => ({ name: u.full_name, email: u.email, role: u.role, uid: u.id })));
    },
  }),
  new DynamicStructuredTool({
    name: "get_all_patients",
    description: "Retrieves all patient accounts from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      const patients = await getPatients();
      return patients.length ? JSON.stringify(patients.map(p => ({ name: p.full_name, email: p.email, uid: p.id }))) : "No patients registered.";
    },
  }),
  new DynamicStructuredTool({
    name: "get_all_doctors",
    description: "Retrieves all doctor accounts from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      const doctors = await getDoctors();
      return doctors.length ? JSON.stringify(doctors.map(d => ({ name: d.full_name, email: d.email, uid: d.id }))) : "No doctors registered.";
    },
  }),
  new DynamicStructuredTool({
    name: "get_all_appointments",
    description: "Retrieves all system-wide appointments from Firestore.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      const apts = await getAllAppointments();
      return apts.length ? JSON.stringify(apts.slice(0, 20)) : "No appointments found.";
    },
  }),
  new DynamicStructuredTool({
    name: "send_notification_to_user",
    description: "Sends a notification to a specific user by their UID.",
    schema: z.object({
      user_uid: z.string().describe("Target user's Firebase UID."),
      title: z.string().describe("Notification title."),
      message: z.string().describe("Notification message."),
    }),
    func: async ({ user_uid, title, message }) => {
      await sendNotificationToUser(user_uid, title, message, 'Admin');
      return `Notification sent to ${user_uid}.`;
    },
  }),
  new DynamicStructuredTool({
    name: "broadcast_notification",
    description: "Broadcasts a notification to ALL registered patients.",
    schema: z.object({
      title: z.string().describe("Broadcast title."),
      message: z.string().describe("Broadcast message body."),
    }),
    func: async ({ title, message }) => {
      const patients = await getPatients();
      await Promise.all(patients.map(p => sendNotificationToUser(p.id, title, message, 'Admin')));
      return `Broadcast sent to ${patients.length} patients.`;
    },
  }),
];

// ─── Agent factory ─────────────────────────────────────────────────────────────
export async function initAdminAgent({ apiKey }) {
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
    stateModifier: `You are the SehatAI Admin Agent with full system-wide access.
You can:
1. View ALL users, patients, and doctors from Firestore
2. See all appointments across the system
3. Send targeted or broadcast notifications to patients
4. Pull live hospital statistics

IMPORTANT: If the user sends a simple greeting, do NOT call tools. Reply professionally.
Always be precise. Reply in English or Hinglish.`,
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
        console.error("Admin Agent error:", error);
        return { output: `Admin AI error: ${error.message}` };
      }
    },
  };
}
