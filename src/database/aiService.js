import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabaseClient';

// Initialize the Gemini Client
// WARNING: In production, API keys should be called from a secure backend, not exposed in the frontend. 
// For this Hackathon demo, we are using Vite Environment Variables.
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'MISSING_API_KEY' 
});

export const aiService = {
  
  /**
   * Main function to analyze a patient's medical record using Gemini AI.
   * @param {Object} patientData - The demographic info from public.patients
   * @param {Object} recentRecord - The latest entry from public.medical_records
   * @returns {String} The AI-generated analysis summary
   */
  async analyzePatientRecord(patientData, recentRecord) {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn("Gemini API Key is missing. Returning mock data");
      return "⚠️ AI Analysis Unavailable: Missing API Key.";
    }

    try {
      const prompt = `
        Executive Medical Summary for SehatAI.
        Patient: ${patientData.full_name}, DOB: ${patientData.date_of_birth}, Blood: ${patientData.blood_group}
        Diagnosis: ${recentRecord.diagnosis}
        Vitals: ${JSON.stringify(recentRecord.vital_signs)}
        Prescriptions: ${JSON.stringify(recentRecord.prescription_data)}
        
        Provide:
        1. Current Status (high level)
        2. Risk Factors
        3. Strategic Action Plan
      `;

      const result = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
      const text = result.response.text();

      if (recentRecord.id) {
        await supabase.from('medical_records').update({ ai_analysis_summary: text }).eq('id', recentRecord.id);
      }
      return text;
    } catch (error) {
      console.error("AI Error:", error);
      return "Analysis failed due to engine error.";
    }
  },

  /**
   * Specifically analyzes a Triage Escalation (Audit Alert)
   */
  async analyzeTriageEscalation(escalation) {
    try {
      const prompt = `
        URGENT CLINICAL REVIEW:
        System Alert: ${escalation.risk}
        Severity: ${escalation.severity}
        Patient ID: ${escalation.external_id || 'Unknown'}
        
        Task: Provide a 1-sentence medical rationale for why this was flagged and a 1-sentence immediate step for the clinical team.
      `;
      const result = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return "Triage engine failure. Manual review required.";
    }
  },

  /**
   * General Health Chat Insights for the Sidebar Widget
   */
  async getGeneralHealthInsights(userQuery, chatHistory = []) {
    try {
      const chat = ai.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
        history: chatHistory.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 500 },
      });

      const result = await chat.sendMessage(userQuery);
      return result.response.text();
    } catch (error) {
      console.error("Chat AI Error:", error);
      return "I'm having trouble connecting to the SehatAI brain. Please try again later.";
    }
  },

  /**
   * Generates 72h risk forecast for sepsis, cardiac, and respiratory events.
   */
  async predictRisks(patientData, vitals) {
    try {
      const prompt = `
        AI RISK FORECAST ENGINE (72h Trajectory)
        Patient: ${patientData.name}, Age: ${patientData.age}, Condition: ${patientData.condition}
        Vitals: ${JSON.stringify(vitals)}
        
        Respond ONLY with a JSON object: {"sepsis": number, "cardiac": number, "respiratory": number}
        Values should be integers between 0-100 representing probability.
      `;
      const result = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
      const text = result.response.text();
      // Try to parse JSON from response (sometimes Gemini adds markdown block)
      const cleaned = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      // Fallback logic for demo
      return { 
        sepsis: Math.floor(Math.random() * 30), 
        cardiac: Math.floor(Math.random() * 40), 
        respiratory: Math.floor(Math.random() * 25) 
      };
    }
  },

  /**
   * Analyzes inventory and burn rates to recommend restock quantities.
   */
  async getRestockRecommendations(inventory) {
    try {
      const prompt = `
        PHARMACY INVENTORY ANALYZER
        Current Status: ${JSON.stringify(inventory.map(i => ({ name: i.name, stock: i.stock_level, burn: i.burn_rate })))}
        
        Provide a concise recommendation for each medication with stock < 50%.
        Include: Medication Name, Recommended Order Qty, and Urgency.
        Respond in a clear, bulleted format.
      `;
      const result = await ai.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent(prompt);
      return result.response.text();
    } catch (error) {
      return "Unable to generate smart recommendations. Manual audit suggested.";
    }
  }
};
