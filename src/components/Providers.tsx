import { QueryClientProvider, QueryClient } from "react-query";
import { SocketContextProvider } from "../contexts/SocketContext";
import { BrowserRouter as Router } from "react-router-dom";
import { UserContextProvider, useUserContext } from "../contexts/UserContext";
import ConversationContextProvider from "@/contexts/ConversationContext";
import { useEffect } from "react";
import { registerForFCM, onForegroundMessage } from "@/utils/fcm";
import { NavigationProvider } from "@/contexts/NavigationContext";
import StatusContextProvider from "@/contexts/StatusContext";
import { ThemeContextProvider } from "@/contexts/ThemeContext";
import { WebRTCProvider } from "@/contexts/WebRTCContext";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let fcmInitDone = false;

export default function Providers({ children }) {
  const queryClient = new QueryClient();
  function SocketWithUser({ children }) {
    const { user } = useUserContext();

    useEffect(() => {
      if (!user?._id) return;
      if (fcmInitDone) return;
      fcmInitDone = true;
      const jwt = localStorage.getItem("tapo_accessToken") || "";
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .catch((err) =>
            console.warn("Service worker registration failed:", err)
          );
      }

      registerForFCM(firebaseConfig, {
        serverUrl: import.meta.env.VITE_API_URL,
        jwt,
        vapidKey,
        platform: "web",
      })
        .then((token) => {
          if (token) console.log("FCM token obtained:", token);
        })
        .catch((e) => console.error("FCM registration failed", e));

      const unsubscribe = onForegroundMessage(firebaseConfig, (payload) => {
        const title = payload.notification?.title ?? "New notification";
        const body = payload.notification?.body ?? "";
        if (Notification.permission === "granted") {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg && "showNotification" in reg) {
              reg.showNotification(title, { body, data: payload.data ?? {} });
            } else {
              new Notification(title, { body, data: payload.data ?? {} });
            }
          });
        }
      });

      return () => {
        try {
          unsubscribe();
        } catch {}
      };
    }, [user?._id]);

    return (
      <SocketContextProvider
        url={`${import.meta.env.VITE_API_URL}`}
        token={null}
        userId={user?._id || ""}
      >
        <ConversationContextProvider>{children}</ConversationContextProvider>
      </SocketContextProvider>
    );
  }
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <NavigationProvider>
            <StatusContextProvider>
              <ThemeContextProvider>
                <SocketWithUser>
                  <WebRTCProvider>{children}</WebRTCProvider>
                </SocketWithUser>
              </ThemeContextProvider>
            </StatusContextProvider>
          </NavigationProvider>
        </UserContextProvider>
      </QueryClientProvider>
    </Router>
  );
}
