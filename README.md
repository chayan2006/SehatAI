# 🏥 SehatAI: Agentic Health Intelligence Portal
> **HIPAA-Ready • Multi-Agent • Predictive Care • Hackathon Demo v1.0**

SehatAI is a state-of-the-art healthcare ecosystem leveraging **Agentic AI** to bridge the gap between patients, doctors, and hospital administrators. Built for speed, security, and intelligence, SehatAI transforms healthcare from reactive to proactive.

---

## 🌟 The Core Innovation: Multi-Agent Orchestration
Unlike traditional portals, SehatAI uses a decentralized agentic engine:
*   **Patient Agent:** Real-time symptomatic analysis, lab report synthesis, and Hindi/English voice support.
*   **Medical Scribe Agent:** Automates clinical notes (SOAP) for doctors using Groq-powered inference.
*   **Sentinel Admin Agent:** Monitors system-wide escalations, blood bank inventory, and emergency dispatch.

---

## 🚀 Portal Ecosystem

### 🧑‍💻 Patient Portal
*   **AI Health Companion:** Context-aware chat with RAG support (vectorized medical history).
*   **Emergency Sentinel:** One-click ambulance dispatch with real-time GPS tracking.
*   **Report Synthesis:** Complex lab results translated into simple, actionable summaries.

### 🏥 Clinician Dashboard
*   **Agentic Triage:** AI-prioritized patient queue based on symptom severity.
*   **Automated Charting:** Voice-to-SOAP note generation to reduce physician burnout.
*   **Resource Management:** Real-time ward occupancy and bed tracking (ICU, General, ER).

### 🛡️ Architect/Admin Gateway
*   **System Integrity:** Secure ISO-certified registration (Requires `VITE_ADMIN_SECRET_KEY`).
*   **Critical Alerts:** High-level dashboard for escalation management and hospital analytics.
*   **Predictive Inventory:** Smart tracking of blood units, oxygen, and critical supplies.

---

## 🛠️ Technology Stack

| Layer | Component |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide |
| **Orchestration** | LangGraph, LangChain JS/TS, Google Gemini 1.5 Flash |
| **Database** | Supabase (PostgreSQL), HNSWLib Vector Store |
| **Security** | Firebase Auth (Portal Sync), HIPAA-compliant patterns |
| **Voice** | Web Speech API (Dual-Language: English & Hindi Support) |

---

## ⚙️ Quickstart for Judges/Developers

### 1. Environment Configuration
Create a `.env.local` based on `.env.example`.
```bash
# Required Keys
VITE_GEMINI_API_KEY="xxx"
VITE_SUPABASE_URL="xxx"
VITE_ADMIN_SECRET_KEY="SEHAT_AI_ARCHITECT_2024"
```

### 2. Deployment & Setup
```bash
# Install dependencies
npm install

# Run the unified portal
npm run dev
```

### 3. Database Migration
Ensure the `schema.sql` is applied to your Supabase instance to enable automated bed-count triggers and user-sync indices.

---

## 📜 Roadmap & Security
*   [x] Refactored Vector Persistence (HNSWLib)
*   [x] Standardized LLM endpoints to Gemini 1.5 Flash
*   [x] Integrated Hindi STT/TTS for Rural Accessibility
*   [x] Strengthened Admin Registration Gatekeeping
*   [ ] Integration with IoT Health Wearables (Next Phase)

---

## 📄 License & Team
**Developed for the Hackathon Demo.** Designed with 💚 by the SehatAI Team.
*Proprietary Agentic Engine Integration.*
e. Default private repository setup.
