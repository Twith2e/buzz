/// <reference lib="webworker" />
// public/firebase-messaging-sw.js (compat approach, simplest)
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCnTa1vUlp8r9f0n_vqBpxbRW8TQWi5xac",
  authDomain: "tapo-messaging-6c439.firebaseapp.com",
  projectId: "tapo-messaging-6c439",
  storageBucket: "tapo-messaging-6c439.firebasestorage.app",
  messagingSenderId: "474535718162",
  appId: "1:474535718162:web:4dcb0c957e8ffd3c2597cb",
  measurementId: "G-KN8XTZM06W",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || "New message";
  const options = {
    body: payload.notification?.body || "",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification?.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});
