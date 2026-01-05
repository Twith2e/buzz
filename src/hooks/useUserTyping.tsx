import { useSocketContext } from "@/contexts/SocketContext";
import { useEffect, useRef } from "react";

const TYPING_TIMEOUT = 3000;
const EMIT_INTERVAL = 500;

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
    if (!typing) return;

    const now = Date.now();
    if (now - lastEmit.current > EMIT_INTERVAL) {
      console.log("[useUserTyping] Emitting typing:sent", {
        conversationId,
        userId,
        typing: true,
      });
      emit("typing:sent", { conversationId, userId, typing: true });
      lastEmit.current = now;
    }

    if (stopTimeout.current) clearTimeout(stopTimeout.current);

    stopTimeout.current = setTimeout(() => {
      console.log("[useUserTyping] Emitting typing:sent (stop)", {
        conversationId,
        userId,
        typing: false,
      });
      emit("typing:sent", { conversationId, userId, typing: false });
      stopTimeout.current = null;
    }, TYPING_TIMEOUT);
  }, [conversationId, userId, typing, emit]);

  useEffect(() => {
    const off = on(
      "typing:received",
      (payload: {
        conversationId: string;
        userId: string;
        typing: boolean;
      }) => {
        console.log("[useUserTyping] Received typing:received", payload, {
          currentConversationId: conversationId,
          currentUserId: userId,
          willProcess:
            payload.conversationId === conversationId &&
            payload.userId !== userId,
        });
        if (
          payload.conversationId !== conversationId ||
          payload.userId === userId
        )
          return;
        onTypingReceived?.(payload.userId, payload.typing);
      }
    );
    return () => off();
  }, [conversationId, userId, typing, emit, on]);
};

export default useUserTyping;
