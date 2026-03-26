/**
 * locationService.js
 * 
 * Handles browser geolocation with automatic permission request.
 * Falls back to Bharat Mandapam, Delhi for prototype testing.
 */

import { BHARAT_MANDAPAM_COORDS, HOSPITAL_LIST } from './hospitalConfig';

/**
 * Haversine formula — distance in km between two lat/lng points
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Request browser geolocation.
 * Returns { lat, lng, label, isFallback }
 * Falls back to Bharat Mandapam if denied or unavailable.
 */
export async function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...BHARAT_MANDAPAM_COORDS, isFallback: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Your Current Location',
          isFallback: false,
        });
      },
      () => {
        // Denied or error — use Bharat Mandapam prototype default
        resolve({ ...BHARAT_MANDAPAM_COORDS, isFallback: true });
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  });
}

/**
 * Returns all hospitals sorted by distance from a given point.
 * Each entry includes distance in km.
 */
export function getHospitalsByDistance(userLat, userLng) {
  return HOSPITAL_LIST
    .map((h) => ({
      ...h,
      distanceKm: haversineDistance(userLat, userLng, h.coords.lat, h.coords.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Get the nearest hospital to the user's location.
 */
export function getNearestHospital(userLat, userLng) {
  return getHospitalsByDistance(userLat, userLng)[0];
}

/**
 * Open Google Maps directions to a hospital from user's location.
 */
export function openDirections(userLat, userLng, hospital) {
  const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${hospital.coords.lat},${hospital.coords.lng}`;
  window.open(url, '_blank');
}
