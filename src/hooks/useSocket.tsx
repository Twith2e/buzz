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
  const [socket, setSocket] = useState<any>(null);
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
    setSocket(socketRef.current);

    const socket = socketRef.current;

    socket.on("connect", () => {
      const isVisible = document.visibilityState === "visible";
      socket.emit("client:visibility", { visible: isVisible });
      console.log("connected:", isVisible);

      setConnected(true);
    });

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      socket.emit("client:visibility", { visible: isVisible });
      console.log("visibilitychange:", isVisible);
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) =>
      console.error("socket connection error", err)
    );
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.disconnect();
      setSocket(null);
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

  return { socket, connected, emit, on };
}
