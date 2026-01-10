// src/utils/fcm.ts
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
  Messaging,
} from "firebase/messaging";
import api from "./api";

export type RegisterForFcmResult = string | null;

export interface RegisterOptions {
  serverUrl: string;
  jwt: string;
  vapidKey: string;
  platform?: string;
}

/**
 * Initialize Firebase app once (idempotent)
 */
function initFirebase(firebaseConfig: Record<string, any>): FirebaseApp {
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
}

/**
 * Register the current browser for FCM push notifications.
 *
 * - Requests notification permission
 * - Gets an FCM token (using provided vapidKey)
 * - Posts token to server at POST `${serverUrl}/api/push/subscribe`
 *
 * Returns the token string on success, or null when user denies permission
 * or token couldn't be retrieved.
 */
export async function registerForFCM(
  firebaseConfig: Record<string, any>,
  opts: RegisterOptions
): Promise<RegisterForFcmResult> {
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
  const { jwt, vapidKey, platform = isPWA ? "pwa" : "web" } = opts;

  // Basic environment checks
  if (typeof window === "undefined") {
    console.warn("registerForFCM called on non-browser environment");
    return null;
  }
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return null;
  }
  if (!("Notification" in window)) {
    console.warn("Notifications are not supported in this browser.");
    return null;
  }

  try {
    // init firebase app (idempotent)
    initFirebase(firebaseConfig);

    // Request permission from the user
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      // user denied or dismissed; return null for caller to handle
      return null;
    }

    // Get Messaging instance
    const messaging: Messaging = getMessaging();

    // Get FCM token. Note: throws on failure.
    const swReg = await navigator.serviceWorker.getRegistration();
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg || undefined,
    });
    if (!currentToken) {
      console.warn("FCM: getToken returned no token");
      return null;
    }

    // Send token to backend to save it
    const resp = await api.post(
      "/push/subscribe",
      { token: currentToken, platform },
      { headers: { Authorization: `Bearer ${jwt}` } }
    );

    if (resp.status !== 200) {
      console.error(
        "Failed to save FCM token on server:",
        resp.status,
        resp.data
      );
      return currentToken;
    }

    return currentToken;
  } catch (err) {
    console.error("registerForFCM error:", err);
    return null;
  }
}

/**
 * Subscribe to foreground messages.
 * Pass a callback that accepts firebase MessagePayload.
 * Returns an unsubscribe function to stop listening.
 */
export function onForegroundMessage(
  firebaseConfig: Record<string, any>,
  cb: (payload: MessagePayload) => void
): () => void {
  // Protect against non-browser or environments without service worker support
  if (typeof window === "undefined") {
    console.warn("onForegroundMessage called in non-browser environment");
    return () => {};
  }

  if (!("serviceWorker" in navigator)) {
    // firebase-messaging expects navigator.serviceWorker; guard to avoid runtime errors
    console.warn(
      "onForegroundMessage: serviceWorker not supported in this environment"
    );
    return () => {};
  }

  // init firebase app (idempotent)
  initFirebase(firebaseConfig);

  try {
    const messaging = getMessaging();

    const unsubscribe = onMessage(messaging, (payload) => {
      try {
        cb(payload);
      } catch (e) {
        console.error("onForegroundMessage callback error:", e);
      }
    });

    // onMessage returns an unsubscribe function in v9; return that to caller
    return () => {
      try {
        unsubscribe();
      } catch (e) {
        // If unsubscribe isn't a function or fails, ignore but log
        console.warn("Failed to unsubscribe onForegroundMessage:", e);
      }
    };
  } catch (err) {
    console.warn("onForegroundMessage: failed to initialize messaging", err);
    return () => {};
  }
}
