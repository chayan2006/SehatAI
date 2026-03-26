/**
 * hospitalConfig.js
 * 
 * Central registry for all 5 hospitals near Bharat Mandapam, Delhi.
 * Each hospital has unique branding, color themes, location data, and contact info.
 */

export const HOSPITALS = {
  lks: {
    id: 'lks',
    supabaseId: '11111111-1111-1111-1111-111111111111',
    name: 'Lok Kalyan Samiti (LKS) Hospital',
    shortName: 'LKS Hospital',
    email: 'admin@lkshospital.in',
    phone: '+91-11-2337-0000',
    address: 'Vishnu Digamber Marg, ITO, New Delhi - 110002',
    location: 'ITO, Opposite Bal Bhawan',
    specialty: 'General & Multi-Specialty Care',
    coords: { lat: 28.6284, lng: 77.2443 },
    theme: {
      primary: '#2563eb',       // Blue
      secondary: '#eff6ff',
      accent: '#1d4ed8',
      gradient: 'from-blue-600 to-blue-800',
      badge: 'bg-blue-100 text-blue-700',
      border: 'border-blue-200',
      ring: 'ring-blue-500',
    },
    icon: 'local_hospital',
    tagline: 'Serving the Community Since 1952',
    beds: 320,
    distance: '0.8 km from Bharat Mandapam',
  },

  gbpant: {
    id: 'gbpant',
    name: 'G.B. Pant Hospital',
    shortName: 'G.B. Pant',
    email: 'admin@gbpanthospital.in',
    phone: '+91-11-2323-4242',
    address: '1, Jawaharlal Nehru Marg, Maulana Azad Medical College Campus, New Delhi - 110002',
    location: 'Maulana Azad Medical College Campus',
    specialty: 'Heart, Brain & Gastroenterology',
    coords: { lat: 28.6341, lng: 77.2373 },
    theme: {
      primary: '#16a34a',       // Green
      secondary: '#f0fdf4',
      accent: '#15803d',
      gradient: 'from-green-600 to-green-800',
      badge: 'bg-green-100 text-green-700',
      border: 'border-green-200',
      ring: 'ring-green-500',
    },
    icon: 'cardiology',
    tagline: 'Premier Public Hospital for Cardiac & Neuro Care',
    beds: 1500,
    distance: '2.1 km from Bharat Mandapam',
  },

  maulana_azad: {
    id: 'maulana_azad',
    name: 'Maulana Azad Dental College',
    shortName: 'MADC',
    email: 'admin@madc.ac.in',
    phone: '+91-11-2328-6000',
    address: 'Bahadur Shah Zafar Marg, LNJP Colony, New Delhi - 110002',
    location: 'Bahadur Shah Zafar Marg, ITO Area',
    specialty: 'Dental & Oral Health',
    coords: { lat: 28.6355, lng: 77.2400 },
    theme: {
      primary: '#7c3aed',       // Violet
      secondary: '#f5f3ff',
      accent: '#6d28d9',
      gradient: 'from-violet-600 to-violet-800',
      badge: 'bg-violet-100 text-violet-700',
      border: 'border-violet-200',
      ring: 'ring-violet-500',
    },
    icon: 'dentistry',
    tagline: 'Excellence in Dental & Oral Health Sciences',
    beds: 400,
    distance: '2.3 km from Bharat Mandapam',
  },

  shroffs: {
    id: 'shroffs',
    name: "Dr. Shroff's Charity Eye Hospital",
    shortName: "Shroff Eye",
    email: 'admin@shroffeyehospital.org',
    phone: '+91-11-2336-0000',
    address: 'Babar Road, Bengali Market, New Delhi - 110001',
    location: 'Bengali Market, Near Connaught Place',
    specialty: 'Ophthalmology & ENT',
    coords: { lat: 28.6280, lng: 77.2197 },
    theme: {
      primary: '#dc2626',       // Red
      secondary: '#fef2f2',
      accent: '#b91c1c',
      gradient: 'from-red-500 to-red-700',
      badge: 'bg-red-100 text-red-700',
      border: 'border-red-200',
      ring: 'ring-red-500',
    },
    icon: 'visibility',
    tagline: 'Restoring Vision, Changing Lives',
    beds: 200,
    distance: '2.6 km from Bharat Mandapam',
  },

  dhli: {
    id: 'dhli',
    name: 'Delhi Heart and Lungs Institute',
    shortName: 'DHLI',
    email: 'admin@delhiheartlungs.in',
    phone: '+91-11-4567-8900',
    address: 'Panchkuian Road, RK Ashram, New Delhi - 110001',
    location: 'Panchkuian Road, near Mandi House/ITO',
    specialty: 'Cardiology & Pulmonology',
    coords: { lat: 28.6364, lng: 77.2092 },
    theme: {
      primary: '#ea580c',       // Orange
      secondary: '#fff7ed',
      accent: '#c2410c',
      gradient: 'from-orange-500 to-orange-700',
      badge: 'bg-orange-100 text-orange-700',
      border: 'border-orange-200',
      ring: 'ring-orange-500',
    },
    icon: 'favorite',
    tagline: 'Advanced Cardiac & Pulmonary Excellence',
    beds: 450,
    distance: '3.1 km from Bharat Mandapam',
  },
};

/** Ordered list for UI rendering */
export const HOSPITAL_LIST = Object.values(HOSPITALS);

/** Get hospital by id */
export function getHospital(id) {
  return HOSPITALS[id] || null;
}

/** Bharat Mandapam reference coords (prototype default location) */
export const BHARAT_MANDAPAM_COORDS = {
  lat: 28.6181,
  lng: 77.2410,
  label: 'Bharat Mandapam (Pragati Maidan), Delhi',
};
