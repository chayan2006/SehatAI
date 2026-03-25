// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyCFaXvSw_JKmMTYAli1YkJjQuPcJvTu3ow",
  authDomain: "sehatai-603f5.firebaseapp.com",
  projectId: "sehatai-603f5",
  storageBucket: "sehatai-603f5.firebasestorage.app",
  messagingSenderId: "221920413016",
  appId: "1:221920413016:web:74440d5754bc635228912d"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || "SehatAI Health Alert";
  const notificationOptions = {
    body: payload.notification.body || "You have a new health update.",
    icon: '/vite.svg', // Using the default vite icon or replace with /logo.png
    badge: '/vite.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
