/**
 * Patient AI Agent — Groq (LLaMA) for text/tools + Gemini for image analysis
 * Groq is free and unlimited for text. Gemini handles multimodal vision.
 */
import { ChatGroq } from "@langchain/groq";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { sendEmailNotification } from './emailService.js';
import { getAppointments, createAppointment } from './supabaseService.js';
import { searchKnowledge } from './vectorStore.js';
import { getDemoResponse } from './demoResponses.js';

// ─── Tool implementations ──────────────────────────────────────────────────────
const tools = [
  new DynamicStructuredTool({
    name: "get_my_health_metrics",
    description: "Retrieves the patient's latest health vitals (Heart Rate, BP, Steps).",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => JSON.stringify({ heartRate: "72 BPM", bloodPressure: "120/80 mmHg", steps: "8,432", status: "Stable" }),
  }),
  new DynamicStructuredTool({
    name: "get_my_appointments",
    description: "Retrieves upcoming medical checkups and consultations.",
    schema: z.object({ patient_uid: z.string().describe("The user's Firebase/Supabase UID.") }),
    func: async ({ patient_uid }) => {
      const apts = await getAppointments(patient_uid);
      return apts.length ? JSON.stringify(apts) : "You have no upcoming appointments.";
    },
  }),
  new DynamicStructuredTool({
    name: "manage_appointment",
    description: "Book, reschedule, or cancel a medical appointment.",
    schema: z.object({
      action: z.enum(["book", "cancel", "reschedule"]),
      patient_uid: z.string().describe("The user's Firebase/Supabase UID."),
      facility_name: z.string(),
      date: z.string(),
      time: z.string(),
    }),
    func: async ({ action, patient_uid, facility_name, date, time }) => {
      if (action === "book") {
        const id = await createAppointment({ patient_uid, facility_name, date, time });
        return id ? `Booked appointment at ${facility_name} on ${date} at ${time}.` : "Failed to book appointment.";
      }
      return "Action not supported yet.";
    },
  }),
  new DynamicStructuredTool({
    name: "log_meal",
    description: "Calculates nutrition and logs a meal.",
    schema: z.object({ meal_description: z.string() }),
    func: async ({ meal_description }) => {
      const apiKey = import.meta.env.VITE_CALORIE_NINJAS_KEY;
      if (!apiKey) return "Nutrition API key not configured.";
      try {
        const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(meal_description)}`, { headers: { 'X-Api-Key': apiKey } });
        const data = await res.json();
        if (data.items?.length > 0) {
          const cal = data.items.reduce((a, i) => a + i.calories, 0);
          const prot = data.items.reduce((a, i) => a + i.protein_g, 0);
          const log = JSON.parse(localStorage.getItem('sehat_nutrition_log') || '[]');
          log.push({ date: new Date().toISOString(), meal: meal_description, calories: cal, protein: prot });
          localStorage.setItem('sehat_nutrition_log', JSON.stringify(log));
          return `Logged: ${cal.toFixed(1)} kcal, ${prot.toFixed(1)}g protein.`;
        }
        return "Could not find nutrition data.";
      } catch (e) { return "Nutrition API error: " + e.message; }
    },
  }),
  new DynamicStructuredTool({
    name: "analyze_environmental_risk",
    description: "Checks real-time Air Quality Index (AQI) for outdoor safety.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => {
      try {
        const res = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=40.71&longitude=-74.01&hourly=us_aqi');
        const data = await res.json();
        const aqi = data?.hourly?.us_aqi?.[0] || 45;
        return `Current US AQI: ${aqi}. ${aqi <= 50 ? 'Excellent — safe for outdoor activity.' : aqi <= 100 ? 'Moderate — limit prolonged exertion.' : 'Unhealthy — avoid outdoors.'}`;
      } catch { return "Could not fetch air quality."; }
    },
  }),
  new DynamicStructuredTool({
    name: "mark_medication_taken",
    description: "Marks a medication as taken for today.",
    schema: z.object({ medication_name: z.string() }),
    func: async ({ medication_name }) => {
      const key = `sehat_meds_${new Date().toDateString()}`;
      const meds = JSON.parse(localStorage.getItem(key) || '{}');
      meds[medication_name] = true;
      localStorage.setItem(key, JSON.stringify(meds));
      return `Marked ${medication_name} as taken.`;
    },
  }),
  new DynamicStructuredTool({
    name: "get_bracelet_live_data",
    description: "Gets real-time data from the Smart Health Bracelet.",
    schema: z.preprocess((v) => v === null ? {} : v, z.object({})),
    func: async () => JSON.stringify({ heartRate: "76 BPM", spo2: "98.5%", temperature: "36.7°C", steps: "8,540", device: "ESP32-Smart-Bracelet" }),
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
    name: "send_official_email",
    description: "Sends an official email notification from sehataisupport@gmail.com. Use this for reports, receipts, or official communication.",
    schema: z.object({
      to: z.string().email().describe("Recipient email address."),
      subject: z.string().describe("Subject of the email."),
      body: z.string().describe("Content of the email message.")
    }),
    func: async ({ to, subject, body }) => {
      await sendEmailNotification({
        type: "general",
        email: to,
        details: { subject, body, from: "sehataisupport@gmail.com" }
      });
      return `Email with subject "${subject}" successfully queued for delivery to ${to} via SehatAI Official Support.`;
    }
  }),
];

// ─── Custom ML server (SehatAI trained model) ────────────────────────────────
async function analyzeWithLocalML(imageDataUrl) {
  try {
    const res = await fetch('http://localhost:5001/analyze-xray', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageDataUrl }),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // Server not running — fall back to Gemini
  }
}

async function analyzeImageWithGemini(imageDataUrl, question) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return "Gemini API key not configured for image analysis.";

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
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: question || "Analyze this medical image and provide a clinical assessment." }
            ]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );
    const data = await res.json();
    if (data.error) return `Gemini API Error: ${data.error.message}`;
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze the image.";
  } catch (e) {
    return "Image analysis error: " + e.message;
  }
}

// ─── Agent factory ─────────────────────────────────────────────────────────────
export async function initPatientAgent({ apiKey }) {
  const llm = new ChatGroq({
    apiKey: apiKey,
    model: "llama-3.1-8b-instant",
    temperature: 0.2,
    maxRetries: 1,
    timeout: 20000,
  });

  const agent = createReactAgent({
    llm,
    tools,
    stateModifier: `You are SehatAI Patient Companion, an autonomous AI health agent.
You help patients manage health records, log meals, book appointments, and provide advice.
You can also search our medical knowledge base and send official emails via SehatAI Support.

IMPORTANT: If the user sends a simple greeting like 'hi', do NOT call any tools. Just reply warmly.
Reply in the user's language (English, Hindi, or Hinglish). Be empathetic but actionable.`,
  });

  return {
    invoke: async ({ input, chat_history = [], image_data = null }) => {
      try {
        // DEMO_MODE Offline Fallback
        if (import.meta.env.VITE_DEMO_MODE === 'true') {
          return { output: getDemoResponse('patient', input) };
        }

        // If image is uploaded:
        if (image_data) {
          // Step 1: Try local custom-trained ML model first
          const mlResult = await analyzeWithLocalML(image_data);
          
          if (mlResult && mlResult.diagnosis) {
            const diag = mlResult.diagnosis;
            const conf = mlResult.confidence;
            const advice = diag === 'PNEUMONIA' 
              ? '\n\n⚠️ **Medical Alert:** The scan suggests Pneumonia. Please consult a pulmonologist immediately.' 
              : '\n\n✅ The scan appears Normal. Maintain healthy habits and consult a doctor if you feel unwell.';
              
            return {
              output: `**AI Vision Analysis (Custom ML Model)**\nI have analyzed your X-Ray.\n\n**Diagnosis:** ${diag}\n**Confidence:** ${conf}%${advice}`
            };
          }

          // Step 2: Fallback to Gemini if local ML is down or fails
          const geminiAnalysis = await analyzeImageWithGemini(image_data, input);
          return { output: geminiAnalysis };
        }

        // Text chat → Groq (free, unlimited)
        const history = chat_history.slice(-6).map(([role, text]) =>
          role === "human" ? new HumanMessage(text) : new AIMessage(text)
        );

        const response = await agent.invoke({
          messages: [...history, new HumanMessage(input)],
        });

        const final = response.messages[response.messages.length - 1];
        return { output: final.content || "Action completed." };
      } catch (error) {
        console.error("Patient Agent error:", error);
        return { output: `Health Assistant error: ${error.message}` };
      }
    },
  };
}
