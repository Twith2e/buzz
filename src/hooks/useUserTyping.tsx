import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useRef } from "react";

const TYPING_TIMEOUT = 3000;
const EMIT_INTERVAL = 1000;

const useUserTyping = ({
  conversationId,
  userId,
  typing,
  onTypingReceived,
}: {
  conversationId: string;
  userId: string;
  typing: boolean;
  onTypingReceived?: (userId: string, typing: boolean) => void;
}) => {
  const { emit, on } = useSocketContext();
  const lastEmit = useRef<number>(0);
  const stopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payload = { conversationId, userId, typing };

  useEffect(() => {
    if (!typing) {
      emit("typing:sent", { conversationId, userId, typing: false });

      // Clear any pending timeout
      if (stopTimeout.current) {
        clearTimeout(stopTimeout.current);
        stopTimeout.current = null;
      }
      return;
    }

    const now = Date.now();
    if (now - lastEmit.current > EMIT_INTERVAL) {
      emit("typing:sent", { conversationId, userId, typing: true });
      lastEmit.current = now;
    }

    // Set interval to continuously emit typing event every EMIT_INTERVAL
    const interval = setInterval(() => {
      emit("typing:sent", { conversationId, userId, typing: true });
      lastEmit.current = Date.now();
    }, EMIT_INTERVAL);

    // Clear any previous timeout
    if (stopTimeout.current) clearTimeout(stopTimeout.current);

    // Set timeout to auto-stop typing after inactivity (as a safety net)
    stopTimeout.current = setTimeout(() => {
      emit("typing:sent", { conversationId, userId, typing: false });
      stopTimeout.current = null;
    }, TYPING_TIMEOUT);

    return () => {
      clearInterval(interval);
    };
  }, [conversationId, userId, typing, emit]);

  useEffect(() => {
    const off = on(
      "typing:received",
      (payload: {
        conversationId: string;
        userId: string;
        typing: boolean;
      }) => {
        if (
          payload.conversationId === conversationId &&
          payload.userId !== userId
        ) {
          onTypingReceived?.(payload.userId, payload.typing);
        }
      }
    );
    return () => off();
  }, [conversationId, userId, on, onTypingReceived]);
};

export default useUserTyping;
