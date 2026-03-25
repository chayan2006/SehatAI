# SehatAI

**SehatAI** is a comprehensive, AI-powered healthcare management platform designed to streamline operations and enhance patient care across multiple portals. It serves Patients, Doctors/Hospital Staff, and Administrators with dedicated interfaces and tailored features.

## 🚀 Key Features by Portal

### 🧑‍⚕️ Patient Portal
*   **Dashboard:** Personalized overview of health metrics and upcoming appointments.
*   **Appointments:** Schedule routine checkups, specialist visits, and telehealth sessions.
*   **Ambulance Booking & Tracking:** Real-time emergency ambulance dispatch and tracking.
*   **Medical History & Lab Results:** Secure access to past records and lab test results.
*   **Medication Management:** Track active prescriptions and receive medication reminders

### 🏥 Doctor & Hospital Portal
*   **Doctor Dashboard:** Overview of daily schedule, patient queue, and critical alerts.
*   **Patient Management:** Access detailed patient histories, vitals, and consultation notes.
*   **Triage & Emergency:** Manage emergency cases and prioritize patient care based on severity.
*   **Ward & Bed Management:** Track bed availability across different hospital wings (ICU, ER, General, etc.).
*   **Pharmacy Orders:** Prescribe medications and track pharmacy fulfillment status.
*   **Billing & Staffing:** Efficiently manage patient billing and staff shifts.

### 🛡️ Admin Portal
*   **Admin Dashboard:** High-level metrics, system health, and analytics.
*   **Escalations & Alerts:** Monitor critical system alerts and AI agent logs.
*   **Inventory Management:** Track supplies like blood units, oxygen, and consumable medical equipment.
*   **Global Ambulance Tracking:** Oversee all active ambulance dispatches across the hospital network.

## 🛠️ Tech Stack & Architecture

### Frontend
*   **Framework:** React 19 with Vite for lightning-fast builds and HMR.
*   **Styling:** Tailwind CSS (v4) for responsive, modern UI design.
*   **Routing:** React Router DOM (v7).
*   **Icons & UI:** Lucide React, Radix UI primitives, Framer Motion for animations, Recharts for analytics.
*   **State Management / PDF:** Custom contexts, jsPDF for report generation.

### Backend & API
*   **Server:** Node.js with Express.
*   **Database:** PostgreSQL hosted on **Supabase** (schema manages users, vitals, wards, appointments, inventory, and audit logs).
*   **Local DB:** `better-sqlite3` is also supported for local/edge implementations.

### AI & Automation Integrations
*   **Generative AI:** Google Gemini API (`@google/genai`, `@langchain/google-genai`) for RAG pipelines, intelligent medical document parsing, and agent workflows.
*   **Groq API:** Utilized for fast inference and routing.
*   **Email Automation:** Integrated via Google Apps Script for live email notifications.
*   **Hosting:** Deployed to **Firebase Hosting**.

## 🔄 System Workflow & Architecture

1.  **Authentication:** Users log in via a unified Gateway (`/`), which routes them to their specific portal (`/portal/patient`, `/portal/doctor`, `/admin/login`) based on their designated role.
2.  **AI Assistant & RAG Pipeline:** The frontend communicates with Gemini/Groq APIs to assist doctors in generating subjective/objective assessments from transcripts, and helping patients understand their lab reports.
3.  **Real-time Capabilities:** Emergency notifications, ambulance tracking, and AI alerts are fed through the backend to the administrative and doctor dashboards.
4.  **Database Triggers:** The Supabase schema includes automated triggers (e.g., auto-updating ward bed counts when a bed is occupied/released).

## ⚙️ Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn
*   A Supabase project (for the PostgreSQL database)
*   Firebase CLI (for deployment)

### 1. Clone & Install
```bash
git clone <repository-url>
cd SehatAI
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory based on the `.env.example`. You will need:
*   `VITE_API_URL` (Backend server URL)
*   `VITE_GEMINI_API_KEY` or `VITE_GROQ_API_KEY`
*   Firebase configuration keys
*   Supabase Database URL (for the backend server)

### 3. Database Setup (Supabase)
1.  Open your Supabase SQL Editor.
2.  Copy the contents of `schema.sql` located in the root directory.
3.  Run the SQL script to generate all required tables, UUID extensions, and seed data.

### 4. Running the Application

**Start the Frontend:**
```bash
npm run dev
```
The app will run locally on `http://localhost:3000` (or `5173`).

**Start the Backend:**
Navigate to the `server/` directory, ensure dependencies are installed, and run the Express server:
```bash
cd server
npm install
npm start (or node index.js)
```

## 📦 Deployment
The application is pre-configured for deployment to Firebase Hosting.
```bash
# Build the production assets
npm run build

# Deploy to Firebase
firebase deploy
```

## 📄 License
Ensure you have the necessary licenses and API quotas from Google AI, Groq, and Supabase before moving to total production scale. Default private repository setup.
