import { useEffect } from "react";
import { formatAttachments } from "@/lib/utils";
import type { ChatMessage } from "@/utils/types";

interface UseMessageHandlersProps {
  on: ((event: string, handler: (data: any) => void) => () => void) | null;
  roomId: string;
  emit: (event: string, data: any) => void;
  setSentMessages: (fn: (prev: any) => ChatMessage[]) => void;
  setUsersOnline: (fn: (prev: any) => any) => void;
}

export function useMessageHandlers({
  on,
  roomId,
  emit,
  setSentMessages,
  setUsersOnline,
}: UseMessageHandlersProps) {
  // Handle incoming messages
  useEffect(() => {
    if (!on) return;

    const handleIncoming = (incoming: any) => {
      const incomingConversationId =
        incoming.conversationId || incoming.conversation;

      // ONLY add to message list if message belongs to the current open room
      if (incomingConversationId !== roomId) {
        return;
      }

      const normalized: ChatMessage =
        incoming && typeof incoming.from === "string"
          ? {
              id: incoming.id || incoming._id,
              conversationId: incomingConversationId,
              from: { _id: incoming.from },
              message: incoming.message,
              ts: incoming.ts,
              status: incoming.status || "sent",
              attachments: formatAttachments(
                incoming.attachment || incoming.attachments,
              ),
              taggedMessage: incoming.taggedMessage,
            }
          : {
              ...incoming,
              attachments: formatAttachments(
                incoming.attachment || incoming.attachments,
              ),
            };

      setSentMessages((prev: any) => {
        const base = Array.isArray(prev) ? (prev as ChatMessage[]) : [];
        return [...base, normalized];
      });

      emit("message:received", {
        messageId: normalized.id || normalized._id,
        roomId,
      });
    };

    const off = on("chat-message", handleIncoming);
    return off;
  }, [on, roomId, emit, setSentMessages]);

  // Handle message delivery status
  useEffect(() => {
    if (!on) return;

    const off = on("message:delivered", ({ messageId }) => {
      setSentMessages((prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return (prev as ChatMessage[]).map((m: ChatMessage) =>
          m.id === messageId ? { ...m, status: "delivered" } : m,
        );
      });
    });

    return off;
  }, [on, setSentMessages]);

  // Handle messages read status
  useEffect(() => {
    if (!on) return;

    const off = on("messages:read", ({ conversationId, upToId }) => {
      if (conversationId !== roomId) return;
      setSentMessages((prev: any) => {
        if (!Array.isArray(prev)) return prev;
        return (prev as ChatMessage[]).map((m: ChatMessage) =>
          m.id === upToId ? { ...m, status: "read" } : m,
        );
      });
    });

    return off;
  }, [on, roomId, setSentMessages]);

  // Handle presence updates
  useEffect(() => {
    if (!on) return;

    const off = on(
      "presence:update",
      ({
        userId,
        online,
        lastSeen,
      }: {
        userId: string;
        online: boolean;
        lastSeen?: string;
      }) => {
        setUsersOnline((prev) => {
          const idx = prev.findIndex((u) => u._id === userId);
          if (idx === -1) return [...prev, { _id: userId, online, lastSeen }];
          const next = [...prev];
          next[idx] = { ...next[idx], online, lastSeen };
          return next;
        });
      },
    );

    return off;
  }, [on, setUsersOnline]);

  // Emit presence update for current user
  useEffect(() => {
    emit("presence:update", {
      online: true,
      lastSeen: new Date().toISOString(),
    });
  }, [roomId, emit]);
}
