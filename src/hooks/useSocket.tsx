import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket({
  url = import.meta.env.VITE_API_URL,
  token = null,
  userId = null,
}: {
  url: string;
  token: string | null;
  userId: string | null;
}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    socketRef.current = io(url, {
      autoConnect: true,
      auth: { token, userId: userId || "" },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("client:visibility", document.visibilityState);
      console.log("connected:", document.visibilityState);

      setConnected(true);
    });

    window.addEventListener("visibilitychange", () => {
      socket.emit("client:visibility", { visible: document.visibilityState });
      console.log("visibilitychange:", document.visibilityState);
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) =>
      console.error("socket connection error", err)
    );
    return () => {
      socket.disconnect();
    };
  }, [url, token, userId]);

  const emit = (event: string, payload: any, ack?: (data: any) => void) => {
    if (ack) {
      socketRef.current?.emit(event, payload, ack);
    } else {
      socketRef.current?.emit(event, payload);
    }
  };

  const on = (event: string, handler: (data: any) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  return { connected, emit, on };
}
