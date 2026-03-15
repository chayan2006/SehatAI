# 🏥 SehatAI — Hospital Role: Complete Step-by-Step Guide

> This document covers the **full journey** of a Hospital/Doctor user — from the moment they register to every single button and screen they see inside the app.

---

## 🚀 STEP 1: Registering as a Hospital

### Where to go
- Open the app → you see the **Gateway Page** (choose your role)
- Click **"Hospital / Doctor Portal"** button

### What you see on the Registration Screen
- **Title**: "Create an account" / "Join Sehat AI to manage your Hospital operations."
- **Role shown**: Hospital (pre-selected based on your gateway choice)

### Fields to fill in:
| Field | What to enter |
|-------|--------------|
| Hospital Name | Your hospital's name (e.g. "City General Hospital") |
| Email | Your professional email (e.g. raja@gmail.com) |
| Password | Minimum 6 characters |

### What happens when you click "Sign Up"
1. Supabase Auth creates your user account (email + password)
2. The database trigger fires automatically and:
   - Creates your **profile** in `public.profiles` with `role = 'doctor'`
   - Creates a **hospital** record in `public.hospitals` with your hospital name
   - Links you to that hospital in `public.hospital_staff`
3. `App.jsx` detects the login → reads your `role = 'doctor'` from session → routes you to the **Hospital Dashboard**

---

## 🖥️ STEP 2: What You See After Login

You are taken directly to the **AdminDashboard** component, which is the main Hospital Command Center.

### The Layout
```
┌─────────────────────────────────────────────────────┐
│  SIDEBAR (left)          │  MAIN CONTENT (right)    │
│  • Sehat AI logo         │  Header with page title  │
│  • Nav items (10 tabs)   │  Sub-navigation links    │
│  • Your profile + logout │  Page content            │
└─────────────────────────────────────────────────────┘
```

### The Sidebar Navigation (left panel)
These are the 10 clickable tabs:

| Tab Name | Icon | What it opens |
|----------|------|---------------|
| Dashboard | grid_view | AI monitoring overview (default page on login) |
| Patient Monitoring | group | Grid of all patients with AI risk scores |
| Agent Status | memory | Each AI agent's current CPU/load status |
| Escalations | report_problem | Full table of critical patient events |
| Security | verified_user | HIPAA security event log |
| Advanced Analytics | insights | Hospital-wide performance charts |
| Resource Map | map | Resource allocation visualization |
| Ward Occupancy | local_hospital | Bed/ward status view |
| Staff Hub | badge | Staff directory and scheduling |
| Audit Logs | history | Complete action history (HIPAA compliance) |

### Bottom of Sidebar
- **Your profile icon** (circle with person icon)
- **Your name**: Dr. Sarah Chen (placeholder — will show real name in future)
- **Your role**: Sr. AI Architect
- **Logout button** (→ icon): Click to sign out and return to the Gateway

---

## 📊 STEP 3: The Dashboard (First Page After Login)

**This is the main page you land on.** It is a real-time hospital monitoring hub.

### Top Header Bar
- **Page Title**: "Admin Pulse Overview"
- **Sub-links**: Systems | Reports | Audit Logs (click to jump between sections)
- **Search bar**: Search through telemetry data
- **Bell icon** (🔔): Notification center — click to open
- **Settings icon** (⚙️): Settings dropdown — click to open

### 🔔 Notifications Panel (click the bell)
Shows a list of real-time alerts:
- Patient emergency notifications (red)
- Drug interaction flags (amber)
- Agent performance updates (green)
- **"Mark all read"** button at the top
- Unread count badge shows on the bell icon

### ⚙️ Settings Dropdown (click the gear)
4 options:
| Option | What it does |
|--------|-------------|
| Admin Profile | Navigates to your Profile page |
| Export Report | Downloads the escalation data as a PDF file |
| Reset Token | Rotates your session security token (sends email) |
| Sign Out | Calls Supabase signOut() → goes back to Gateway |

### Main Dashboard Content
4 metric cards at the top:

| Card | What it shows |
|------|--------------|
| Total metric | Live patient/agent count |
| Throughput % | AI processing rate (updates every 3 seconds) |
| Critical Count | Number of active unresolved escalations |
| Response Time | Avg AI agent response time |

### Active Escalations Table
A real-time table of critical patient events. Each row has:
- **Patient ID** — e.g. #PX-8812
- **Detected Risk** — e.g. "Anomalous Heart Rate Spike"
- **Agent Responsible** — which AI agent flagged it (e.g. Vitals-Agent-04)
- **Timestamp** — when the event occurred
- **Two action buttons**:
  - 🟡 **"Analyze"** — Calls Google Gemini AI to give you a clinical resolution strategy. The AI response appears directly under the row.
  - 🔴 **"OVERRIDE"** — Opens a confirmation modal to manually resolve the case. This action is LOGGED to the HIPAA audit trail.

### Override Confirmation Modal
When you click OVERRIDE, a popup appears showing:
- The patient ID and detected risk
- A warning: "This action will be logged in the HIPAA audit trail."
- **Cancel** button (does nothing)
- **Confirm Override** (red button) — resolves the escalation, logs it to `audit_logs`

### AI Floating Chat Widget (bottom right corner)
A green circle button with a chat icon. Click it to open the SehatAI Assistant:
- Chat window with the AI: "Powered by Gemini 1.5 Pro"
- **Type your question** (e.g. "What is the status of patient #PX-8812?")
- **Voice Chat button** — toggles voice mode:
  - 🎤 "Listening..." — speaks and transcribes your voice
  - 🔊 "Speaking..." — AI reads its response aloud
- Send button (arrow) → submits your message

---

## 👤 STEP 4: Patient Management

**How to open:** Click **"Patient Monitoring"** in the left sidebar.

### What you see
A table of all your assigned patients with live vitals.

### Header Area
- Title: "My Patients" + a badge: "AI Predictive Engine Active"
- **"Show 72h Forecast"** button – toggles between risk score view and per-disease forecast view
- **"Add Patient"** button (green) – opens a dialog

### Adding a New Patient
Click "Add Patient" → A popup appears with 3 fields:
| Field | What to enter |
|-------|--------------|
| Name | Patient's full name |
| Age | Patient's age (number) |
| Condition | Primary medical condition (e.g. "Diabetes Type 2") |

Click **"Save Patient"** → Patient is added to the top of the table instantly.

### Patient Table Columns

#### Column 1: Patient Roster
Shows the patient's:
- Avatar circle (initials, red if Critical)
- Full Name
- Age and auto-generated ID (e.g. PX-8812)

#### Column 2: Health Status & AI Insights
- **Condition name** (e.g. "Arrhythmia")
- **AI Note** in a small pill (e.g. "Sustained tachycardia detected.")

#### Column 3: Vitals Pulse
- **Heart Rate** in BPM — shown in **red** + animated pulse if HR > 100
- **Blood Pressure** in mmHg

#### Column 4: Risk Score / 72h Forecast
- **Default view**: A coloured progress bar showing 0-100 risk score
  - Green (0-50): Safe
  - Amber (50-80): Warning
  - Red (80-100): Critical
- **When "Show 72h Forecast" is ON**: Three circular charts appear:
  - 🔴 **Sepsis** — % probability in next 72 hours
  - 🔵 **Cardiac** — % probability in next 72 hours
  - 🟠 **Respiratory** — % probability in next 72 hours
  - Hover over any circle → tooltip shows exact percentage

#### Column 5: Actions
- **"Chart"** button → view the patient's full medical chart
- **Trash** icon → removes the patient from your roster

---

## 🚨 STEP 5: Emergency / Triage

**How to open:** Click **"Escalations"** tab in the sidebar or the **"Emergency"** tab in DoctorSidebar.

### Three stat cards at the top
| Card | What it shows |
|------|--------------|
| Priority Index (9.8/10) | The AI's urgency score for the current situation |
| Wait Time Impact (-18 min) | How much AI routing has reduced ER wait time |
| Next Escalation Risk | Ranked list of next high-risk patients |

### Active Emergencies Section (red section)
Patients that need immediate intervention right now:

Each card shows:
- 🔴 Animated pulsing badge (e.g. "In Progress")
- Time of event
- Emergency type + Patient name + age
- Full description of the event (e.g. "Sustained Heart Rate > 110 bpm for 15 minutes")
- AI action already taken (e.g. "Ambulance Dispatched & Caregiver Notified")
- **"Track EMS"** button → tracks the ambulance in real-time
- **"Emergency Telehealth"** button → launches a video call with the patient
- **"View Full Chart"** button → opens the patient's medical chart

### AI Escalations Section (amber section)
Lower-urgency events flagged by AI that need your review:

Each card shows:
- Amber badge: "Pending Review"
- Escalation type (e.g. "Medication Non-Adherence")
- Patient name, age, full description
- **AI Recommendation box** (yellow) — what the AI already tried or suggests
- **"Approve & Schedule"** button → confirms the AI's suggestion and books an appointment
- **"Dismiss"** button → marks the escalation as reviewed and closes it

---

## 👥 STEP 6: Staff Management

**How to open:** Click **"Staff Hub"** in the sidebar.

### Top KPI Cards (4 summary stats)
| Stat | What it shows |
|------|--------------|
| Total Staff | All staff in the system |
| On-Duty Now | Staff currently active on shift |
| Staff on Leave | Staff currently off |
| Avg Shift Length | Average hours per shift (8.5 hrs) |

### Staff Directory (main table)
Shows: Avatar image, Name, Email, Role badge, Department, On-Duty status dot.

**Search bar**: Type any name, role, or department to filter the list in real time.

**Edit (pencil icon)**: Click the edit icon on any staff row → opens Edit dialog with fields:
- Full Name, Email, Role (Doctor/Nurse/Admin/Technician), Status (On Duty/Off Duty), Department
- **Save Changes** button → updates the record
- **Remove User** button (red) → deletes the staff from the directory

**"Add New Staff" button** (top right): Opens a form with same fields → click "Save Staff" to add.

### Staff Schedule Calendar (right side)
- Full monthly calendar with dots showing scheduled shifts
- Click any date → see the shift details panel below
  - Shows: Shift name, time block, number of staff assigned
- **"Assign"** button (top of calendar): Opens a dialog to assign a staff member to a shift:
  - Select Staff (dropdown from your directory)
  - Pick Date (date picker)
  - Pick Shift Block: Morning Shift (ER) / Evening Shift (ICU) / Night Shift (Ward)
  - Click **"Save Assignment"** → shift dot appears on the calendar

### Recent Staff Activity Feed (below calendar)
Real-time log of everything that's happened:
- Dr. X checked in for shift
- Y submitted leave request
- Shift swap approved
- New staff onboarded
- Updates live when you make changes in the UI

---

## 💓 STEP 7: Vitals Monitoring

**How to open:** Click **"Vitals"** tab in the sidebar.

### Critical Alert Banner (top of page)
If any patient is in critical condition, a red animated banner appears at the top:
- "Critical Alert: Ward 402 - Bed 03"
- Full description: "Tachycardia detected. HR exceeded 140 BPM for >2 mins"
- **"Dismiss"** button — hides the banner
- **"View Patient"** button — selects that patient on the monitoring grid

### Monitored Patients Grid
3 patient cards side-by-side. Each card shows:
- Patient name, ID, ward location
- Status badge: **Critical** (red border + pulsing dot) or **Monitoring** (green)
- 4 live vital boxes (updating every 3 seconds automatically):
  - **Heart Rate** in BPM — with a mini waveform chart
  - **SpO2** in % — oxygen saturation
  - **Blood Pressure** in mmHg
  - **Temperature** in °C
- Click a card → it becomes selected (highlighted ring) and the detailed chart below updates

**"Add Monitor" button**: Connect a new patient to the tracking board:
- Enter: Name, Patient ID, Ward number
- Click "Connect Monitor" → new card appears with baseline vitals (75 BPM, 98% SpO2)

### Vital Trends Chart (selected patient)
A large line chart for the selected patient:
- X axis = time, Y axis = heart rate
- Critical patients show a jagged spike line (red)
- Stable patients show a flat line (green)
- **AI Prediction Zone** — right quarter is shaded, labeled "AI PREDICTION ZONE"
- Time range selector: **1H / 6H / 24H / 7D** buttons
- Below chart: Min HR | Max HR | Avg HR | Variability stats

### AI Lab Interpreter (right sidebar card)
For patients that have lab results attached:
- Shows each lab test result (e.g. WBC, CRP)
- Value + unit + status badge (High / Critical)
- **AI Insight** for each result (e.g. "Elevation suggests active infection")
- **"Scan New Lab Report"** button → allows uploading a new lab report file

### Wearable Telemetry (right sidebar card)
Shows the IoT wearable device sync status for the selected patient:
- **Battery Health**: percentage with a colour bar
- **Signal Link**: connection strength badge
- **Last Data Sync**: "2.4s ago" — live mini bar chart showing heartbeat data
- **"Resync All Wearables"** button → forces reconnection

---

## 🛏️ STEP 8: Ward / Bed Management

**How to open:** Click **"Ward/Bed"** in the sidebar.

### 4 Summary Cards
| Card | Shows |
|------|-------|
| Total Beds | Total beds in the hospital (120) |
| Available | Beds currently empty (green) |
| Occupied | Beds with patients (amber) |
| Maintenance | Beds out of service (red) |

### Ward 1: ICU (bed-by-bed grid)
Each bed is shown as a card:

**Occupied bed** (shown in grey/red):
- Bed number, patient name, admission time
- Condition status (Stable / Critical)
- Flashing red dot if Critical
- **"Discharge"** button → removes patient from the bed, marks it as Available

**Available bed** (shown in green):
- Shows "Available (Click to Assign)"
- Click the card → instantly assigns a "New Patient" to that bed (interactive demo)

**Maintenance bed** (shown in grey):
- Shows a warning icon and "Maintenance" label
- Not clickable

---

## 💊 STEP 9: Pharmacy

**How to open:** Click **"Pharmacy"** in the sidebar.

Shows the hospital's drug inventory and prescription management system including:
- Drug stock levels with reorder alerts
- Prescription approval workflows
- AI-powered drug interaction warnings
- Dispensing logs

---

## 💰 STEP 10: Billing

**How to open:** Click **"Billing"** in the sidebar.

### 3 KPI Cards
| Card | Shows |
|------|-------|
| Total Revenue | $45,280.00 (+12.5% vs last 30 days) |
| Pending Claims | 128 active insurance claims (avg 4-day processing) |
| Outstanding Invoices | $12,450.00 in unpaid invoices |

### Daily Collections Chart
Bar chart for the last 7 days (Mon–Sun):
- Hover over any bar → tooltip shows the exact dollar amount for that day
- **CSV** and **PDF** export buttons

### Insurance Provider Status
Shows claim approval rate per provider:
- Blue Cross: 82%
- Aetna: 45%
- Medicare: 68%
- Cigna: 23%

### Recent Invoices Table
Columns: Patient Name | Provider | Invoice Date | Amount | Status | Actions

Status badges:
- **Paid** (green)
- **Partial** (blue) — partially paid
- **Overdue** (red)

**"New Invoice"** button → create a new patient invoice.

Three-dot menu (⋮) on each row → more actions per invoice.

---

## 👤 STEP 11: Your Profile Page

**How to open:** Click Settings icon (⚙️) → "Admin Profile"

### What you can see and edit

**Profile Identity Card:**
- Avatar with camera icon to change photo
- Name: Dr. Sarah Chen
- Role: Chief AI Architect
- HIPAA Tier 3 Access badge
- Last Login time
- **"Edit Profile"** button — toggles edit mode on/off

**Account Details (when in edit mode):**
- Institutional Role (text)
- Professional Email
- Direct Line (phone)
- **"Save Changes"** button — saves your edits

**Security Hub:**
- **Two-Factor Authentication**: Toggle button (Enable / Disable 2FA)
- **Hardware Keys (YubiKeys)**: Shows registered keys with serial numbers
  - **"Revoke"** button next to each key
  - **"+ Register New Key"** button to add a new YubiKey
- **Last Password Change** and **Active Sessions** stats
- **"Reset Security Token"** button

**Notification Preferences:**
Toggle on/off for each:
- Critical Alert SMS
- Email Reports
- Push Notifications

**Connected Cloud & Medical IoT:**
Shows connected devices/services (e.g. Stripe, EHR, lab systems):
- Each shows: service name, detail, connection status (STABLE / DISCONNECTED)
- **"Disconnect"** / **"Reconnect"** buttons per device
- **"Link New Healthcare Endpoint"** button at the bottom

---

## 🔒 How Logout Works

There are **3 ways** to log out from the Hospital Portal:

1. **Sidebar logout button** (→ icon at the bottom left of sidebar) — calls `userService.signOut()` → clears session → goes to Gateway
2. **Settings dropdown → "Sign Out"** — same as above
3. **Bottom-left profile circle → Settings → "Sign Out"** — same

All three now properly clear the Supabase authentication session (this was the bug that was recently fixed).

---

## 🗄️ What Data Gets Stored for the Hospital Role

| Table | What the Hospital role creates/reads |
|-------|--------------------------------------|
| `profiles` | Doctor/Admin users (role = 'doctor') |
| `hospitals` | Hospital record with name and admin ID |
| `hospital_staff` | Links doctor to hospital |
| `patients` | Patient records managed by the hospital |
| `appointments` | Booked appointment slots |
| `medical_records` | Diagnoses, vitals, AI summaries |
| `record_attachments` | Lab report file links |
| `audit_logs` | Every clinical action (HIPAA compliance) |
| `subscriptions` | Hospital's billing plan (Free/Pro/Enterprise) |
| `ai_chat_sessions` | AI chat conversations per doctor |
| `ai_chat_messages` | Individual AI chat messages |
