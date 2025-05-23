// firebase-messaging-sw.js
// This file should be placed in the public directory of your React app

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
// Your Firebase configuration - replace with your actual config
// const firebaseConfig = {
//   apiKey: self.FIREBASE_API_KEY || "YOUR_API_KEY",
//   authDomain: self.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
//   projectId: self.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
//   storageBucket: self.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
//   messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
//   appId: self.FIREBASE_APP_ID || "YOUR_APP_ID"
// };

const firebaseConfig = {
    apiKey: "AIzaSyDu8wQNkLXO35cdGrFPJlMMgbc1K2op7Us",
    authDomain: "meetnmart.firebaseapp.com",
    projectId: "meetnmart",
    storageBucket: "meetnmart.firebasestorage.app",
    messagingSenderId: "82487166386",
    appId: "1:82487166386:web:78f5db4c34a1774943d0ab",
    measurementId: "G-S49WCFPB80"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Received background message:', payload);

  const data = payload.data || {};
  const notificationTitle = payload.notification?.title || data.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || data.body || '',
    icon: payload.notification?.icon || data.icon || '/notification.png',
    badge: data.badge || '/badge-icon.png',
    tag: data.tag || '',
    data: data 
  };

  // Add actions for call notifications
  if (data.type === 'call') {
    notificationOptions.actions = [
      {
        action: 'accept-call',
        title: data.callType === 'video' ? 'Accept Video' : 'Accept',
        icon: data.callType === 'video' ? '/video-calling.png' : '/phone-calling.png'
      },
      {
        action: 'reject-call',
        title: 'Reject',
        icon: '/phone-call-cancel-reject.png'
      }
    ];
    notificationOptions.requireInteraction = true;
    notificationOptions.tag = `call-${data.callId}`;
  }

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action || 'default';
  const data = event.notification.data || {};
  const clickUrl = data.url || '/';
  
  // Handle specific actions
  if (action === 'accept-call' && data.callId) {
    // Add call ID to URL for deep linking
    const callUrl = `/calls/${data.callId}?accepted=true&autoJoin=true`;
    
    // Open or focus the window and navigate to the call screen
    event.waitUntil(handleNotificationClick(callUrl, data));
  } else if (action === 'reject-call' && data.callId) {
    // Make API call to reject the call
    event.waitUntil(
      fetch(`/api/calls/${data.callId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(err => {
        console.error('[Service Worker] Failed to reject call:', err);
      })
    );
  } else {
    // Default action - open the app or specific URL
    event.waitUntil(handleNotificationClick(clickUrl, data));
  }
});

/**
 * Handle notification click by focusing or opening window
 */
async function handleNotificationClick(url, data) {
  const windowClients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });
  
  // Try to focus an existing window
  for (const client of windowClients) {
    if (client.url.includes(self.registration.scope) && 'focus' in client) {
      await client.focus();
      await client.navigate(url);
      
      // Post message to client with notification data
      client.postMessage({
        type: 'NOTIFICATION_CLICK',
        action: 'default',
        data
      });
      
      return;
    }
  }
  
  // If no existing window, open a new one
  if (self.clients.openWindow) {
    return self.clients.openWindow(url);
  }
}