/**
 * emergencyAgent.js
 *
 * AI-driven emergency response agent for SehatAI.
 * Automatically books ambulance, finds nearby doctors, and
 * prioritizes response based on patient medical history.
 */

import { HOSPITAL_LIST, getHospital } from './hospitalConfig';
import { getHospitalsByDistance } from './locationService';

/** Simulated ambulance services near Bharat Mandapam */
const AMBULANCE_SERVICES = [
  { id: 'amb001', name: 'Delhi 108 Ambulance', phone: '108', eta: '5-8 min', type: 'Advanced Life Support', available: true },
  { id: 'amb002', name: 'Red Cross Delhi', phone: '011-23711551', eta: '8-12 min', type: 'Basic Life Support', available: true },
  { id: 'amb003', name: 'Ziqitza Health Care', phone: '1800-313-1414', eta: '10-15 min', type: 'BLS + ICU', available: true },
];

/** Emergency priority levels */
export const PRIORITY = {
  CRITICAL: { level: 'CRITICAL', color: 'text-red-600 bg-red-50 border-red-200', icon: 'emergency', eta: '< 5 min' },
  HIGH: { level: 'HIGH', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: 'warning', eta: '< 10 min' },
  MODERATE: { level: 'MODERATE', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: 'info', eta: '< 20 min' },
  LOW: { level: 'LOW', color: 'text-green-600 bg-green-50 border-green-200', icon: 'check_circle', eta: '< 30 min' },
};

/**
 * Determine emergency priority based on symptoms & patient medical profile.
 */
export function assessPriority(symptoms, medicalProfile) {
  const critical = ['cardiac', 'heart attack', 'stroke', 'unconscious', 'not breathing', 'chest pain', 'severe bleeding'];
  const high = ['fracture', 'broken bone', 'severe pain', 'head injury', 'fall', 'accident', 'burn'];
  const sym = symptoms.toLowerCase();

  if (critical.some(k => sym.includes(k))) return PRIORITY.CRITICAL;
  if (high.some(k => sym.includes(k))) return PRIORITY.HIGH;

  // Escalate based on chronic conditions
  if (medicalProfile?.chronicConditions) {
    const chronic = medicalProfile.chronicConditions.toLowerCase();
    if (chronic.includes('diabetes') || chronic.includes('hypertension') || chronic.includes('heart')) {
      return PRIORITY.HIGH;
    }
  }

  // Escalate if recent injury
  if (medicalProfile?.hasRecentInjury) return PRIORITY.MODERATE;

  return PRIORITY.LOW;
}

/**
 * Main emergency dispatch agent.
 * Returns a structured response with ambulance booking, hospital, doctor.
 */
export async function dispatchEmergency({ symptoms, userLocation, medicalProfile, primaryHospitalId }) {
  // 1. Assess priority
  const priority = assessPriority(symptoms, medicalProfile);

  // 2. Find nearest hospital
  const sorted = getHospitalsByDistance(
    userLocation?.lat || 28.6181,
    userLocation?.lng || 77.2410
  );
  const nearestHospital = sorted[0];
  const primaryHospital = primaryHospitalId ? getHospital(primaryHospitalId) : null;
  const targetHospital = priority.level === 'CRITICAL' ? nearestHospital : (primaryHospital || nearestHospital);

  // 3. Select ambulance
  const ambulance = priority.level === 'CRITICAL'
    ? AMBULANCE_SERVICES[0]  // 108 for critical
    : AMBULANCE_SERVICES[Math.floor(Math.random() * AMBULANCE_SERVICES.length)];

  // 4. Find available nearby doctors (simulated)
  const doctors = getNearbyDoctors(targetHospital, symptoms);

  // 5. Build incident report
  const incident = {
    incidentId: `INC-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    status: 'DISPATCHED',
    priority,
    symptoms,
    targetHospital,
    nearestHospital,
    ambulance: {
      ...ambulance,
      booked: true,
      dispatchTime: new Date().toISOString(),
    },
    assignedDoctors: doctors,
    userLocation: userLocation || { lat: 28.6181, lng: 77.2410, label: 'Bharat Mandapam (Prototype)' },
    estimatedArrival: ambulance.eta,
    instructions: getFirstAidInstructions(symptoms),
    agentActions: buildAgentLog(priority, ambulance, targetHospital, doctors),
  };

  return incident;
}

/** Get mock nearby available doctors for the target hospital specialty */
function getNearbyDoctors(hospital, symptoms) {
  const specialtyDoctors = {
    lks: [
      { name: 'Dr. Rajesh Kumar', specialty: 'General Medicine', phone: '+91-98765-43210', available: true },
      { name: 'Dr. Priya Sharma', specialty: 'Emergency Medicine', phone: '+91-98765-43211', available: true },
    ],
    gbpant: [
      { name: 'Dr. Anil Mehta', specialty: 'Cardiology', phone: '+91-98765-11111', available: true },
      { name: 'Dr. Sunita Rao', specialty: 'Neurology', phone: '+91-98765-22222', available: true },
    ],
    maulana_azad: [
      { name: 'Dr. Farhan Ansari', specialty: 'Oral Surgery', phone: '+91-98765-33333', available: true },
      { name: 'Dr. Deepa Chopra', specialty: 'Periodontology', phone: '+91-98765-44444', available: true },
    ],
    shroffs: [
      { name: 'Dr. Manish Gupta', specialty: 'Ophthalmology', phone: '+91-98765-55555', available: true },
      { name: 'Dr. Neha Singh', specialty: 'ENT', phone: '+91-98765-66666', available: true },
    ],
    dhli: [
      { name: 'Dr. Vikram Patel', specialty: 'Cardiology', phone: '+91-98765-77777', available: true },
      { name: 'Dr. Anita Bose', specialty: 'Pulmonology', phone: '+91-98765-88888', available: true },
    ],
  };
  return specialtyDoctors[hospital?.id] || specialtyDoctors.lks;
}

/** First-aid instructions based on symptoms */
function getFirstAidInstructions(symptoms) {
  const sym = symptoms.toLowerCase();
  if (sym.includes('chest') || sym.includes('cardiac')) {
    return 'Keep patient still. Loosen tight clothing. Do NOT give anything by mouth. Begin CPR if patient becomes unresponsive.';
  }
  if (sym.includes('bleed')) {
    return 'Apply firm direct pressure with a clean cloth. Elevate the wounded area above heart level if possible.';
  }
  if (sym.includes('burn')) {
    return 'Cool the burn with cool (not cold) running water for 10-20 minutes. Do NOT apply ice or creams.';
  }
  if (sym.includes('fracture') || sym.includes('broken')) {
    return 'Immobilize the limb. Do NOT attempt to realign. Apply ice pack wrapped in cloth to reduce swelling.';
  }
  return 'Keep patient calm and still. Monitor breathing and pulse. Do not leave the patient alone.';
}

/** Build human-readable agent action log */
function buildAgentLog(priority, ambulance, hospital, doctors) {
  return [
    { time: new Date().toISOString(), action: `🚨 Emergency assessed: Priority ${priority.level}`, type: 'assess' },
    { time: new Date(Date.now() + 1000).toISOString(), action: `🚑 Ambulance dispatched: ${ambulance.name} (ETA: ${ambulance.eta})`, type: 'dispatch' },
    { time: new Date(Date.now() + 2000).toISOString(), action: `🏥 Routing to: ${hospital?.name || 'Nearest Hospital'}`, type: 'route' },
    { time: new Date(Date.now() + 3000).toISOString(), action: `👨‍⚕️ Notified Dr. ${doctors[0]?.name.split(' ').pop()} (${doctors[0]?.specialty})`, type: 'notify' },
    { time: new Date(Date.now() + 4000).toISOString(), action: `📋 First-aid instructions sent to patient`, type: 'info' },
  ];
}
