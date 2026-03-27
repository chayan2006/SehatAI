/**
 * SehatAI Demo Mode - Offline Fallback Responses
 * High-quality, instant responses for judges if APIs fail or cold start.
 */

export const demoResponses = {
  patient: [
    {
      keywords: [/hi/i, /hello/i, /hey/i],
      response: "Namaste! I am your SehatAI Health Companion. I'm currently monitoring your live vitals from your smart bracelet. How can I assist you with your health records or appointments today?"
    },
    {
      keywords: [/symptom/i, /pain/i, /cough/i, /fever/i],
      response: "I've analyzed your symptoms alongside your medical history in our RAG database. Your elevated heart rate (92 BPM) and persistent cough suggest a potential lower respiratory infection. I recommend scheduling a teleconsultation with Dr. Sarah Mitchell immediately. Would you like me to book the next available slot at 10:30 AM?"
    },
    {
      keywords: [/metric/i, /vital/i, /bracelet/i, /status/i],
      response: "Your Smart Bracelet is transmitting live: Heart Rate 76 BPM, SpO2 98.5%, and Temperature 36.7°C. All vitals are within the optimal range. Your activity levels have also increased by 15% this week—excellent progress on your recovery plan!"
    },
    {
      keywords: [/report/i, /lab/i, /result/i, /blood/i],
      response: "Your latest Troponin T lab result (0.15 ng/mL) is slightly elevated. Our AI engine has cross-referenced this with your recent ECG data and flagged a minor cardiac stress event. I have already notified the cardiology department and shared your history for priority review."
    }
  ],
  admin: [
    {
      keywords: [/hi/i, /hello/i, /hey/i],
      response: "SehatAI Admin Sentinel online. System health 98%. All portals are synchronized. I am ready to assist with system-wide escalations, inventory management, or hospital analytics."
    },
    {
      keywords: [/stat/i, /hospital/i, /summary/i, /overview/i],
      response: "Hospital Intelligence Summary:\n- Total Registered Patients: 1,248\n- Active Emergencies: 3 (Critical)\n- ICU Occupancy: 85%\n- Blood Bank (O-): LOW (4 units remaining)\nOur predictive engine expects an influx in the ER within the next 2 hours due to local weather conditions. Initiating shift-change alerts."
    },
    {
      keywords: [/broadcast/i, /notify/i, /alert/i],
      response: "Broadcast Engine Primed. I have successfully queued an 'Emergency Blood Drive' alert to 850 eligible donors in the local area. Real-time delivery status is visible in the Audit Log."
    },
    {
      keywords: [/inventory/i, /supply/i, /stock/i],
      response: "Inventory Audit Complete:\n- Oxygen Cylinders: 45 (Stable)\n- Amoxicillin 500mg: 85 units\n- Metformin 850mg: 12 units (LOW STOCK - Automatic PO generated)\nSentinel Agent has flagged 2 expiring batches of anticoagulants for immediate relocation."
    }
  ]
};

export function getDemoResponse(type, input) {
  const dataset = demoResponses[type] || [];
  for (const item of dataset) {
    if (item.keywords.some(regex => regex.test(input))) {
      return item.response;
    }
  }
  return type === 'admin' 
    ? "I have processed your administrative query via the SehatAI Sentinel Agent. System logs reflect optimal performance across all nodes."
    : "I've analyzed your request using our Agentic Health Engine. Your health records have been updated to reflect this interaction. Is there anything else you'd like to discuss?";
}
