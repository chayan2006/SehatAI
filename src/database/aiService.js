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
      console.warn("Gemini API Key is missing. Returning mock data for UI testing.");
      return "⚠️ AI Analysis Unavailable: Missing API Key. Please add VITE_GEMINI_API_KEY to your .env file.";
    }

    try {
      // 1. Construct the Medical Prompt Context
      const prompt = `
        You are SehatAI, an expert medical analysis assistant. Your job is to review the following patient data and medical records, and provide a concise, professional executive summary for the attending physician. Highlight any critical risks or necessary immediate actions.

        PATIENT DEMOGRAPHICS:
        - Date of Birth: ${patientData.date_of_birth || 'Unknown'}
        - Blood Group: ${patientData.blood_group || 'Unknown'}
        - Medical History Summary: ${patientData.medical_history_summary || 'None on file'}

        CURRENT VISIT RECORD:
        - Diagnosis: ${recentRecord.diagnosis || 'Pending'}
        - Vitals: ${JSON.stringify(recentRecord.vital_signs || {})}
        - Prescriptions: ${JSON.stringify(recentRecord.prescription_data || {})}
        
        OUTPUT FORMAT:
        Provide a 3-bullet point summary of the patient's status, followed by 1 actionable recommendation.
      `;

      // 2. Call the Gemini API
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const analysisRawText = response.text;

      // 3. (Optional) Save this analysis back to the database automatically
      if (recentRecord.id) {
        await supabase
          .from('medical_records')
          .update({ ai_analysis_summary: analysisRawText })
          .eq('id', recentRecord.id);
      }

      return analysisRawText;

    } catch (error) {
      console.error("Error during AI Analysis:", error);
      throw new Error("Failed to generate AI analysis. Please check console for details.");
    }
  }
};
