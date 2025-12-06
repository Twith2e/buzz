import { useCallback } from "react";
import { makeClientId } from "@/lib/utils";
import type { ChatMessage } from "@/utils/types";

/**
 * useSendMessage encapsulates optimistic sending and ack handling for chat messages.
 * It validates connectivity, appends an optimistic message, emits over socket,
 * and reconciles the optimistic entry with server ack response.
 */
export function useSendMessage({
  emit,
  roomId,
  userId,
  initialized,
  connected,
  selectedMessageId,
  selectedTag,
  sentMessages,
  setSentMessages,
}: {
  emit: (event: string, payload: any, cb: (ack: any) => void) => void;
  roomId: string | null;
  userId: string | undefined;
  initialized: boolean;
  connected: boolean;
  selectedMessageId: string | null;
  selectedTag: any | null;
  sentMessages: ChatMessage[];
  setSentMessages: (updater: (prev: any) => any) => void;
}) {
  /**
   * Send a message with optional attachments using optimistic UI and ack handling.
   * Optionally skip optimistic append when you already added an optimistic entry.
   */
  const sendMessage = useCallback(
    (
      text: string,
      attachments?: Array<{
        url: string;
        originalFilename?: string;
        bytes?: number;
        publicId?: string;
        resourceType?: string;
        format?: string;
        width?: number;
        height?: number;
      }>,
      clientTempId?: string,
      options?: { skipOptimistic?: boolean }
    ) => {
      if (!text && (!attachments || attachments.length === 0)) return;
      if (!initialized || !roomId) {
        console.error("Initialized or room id does not exist");
        return;
      }
      if (!connected) {
        console.error("Socket not connected");
        return;
      }

      const tempId = clientTempId || makeClientId();

      // Build tagged snapshot
      let tagged: any = null;
      if (selectedMessageId) {
        const found = (sentMessages || []).find(
          (m: any) => (m._id || m.id) === selectedMessageId
        );
        if (found) {
          tagged = {
            _id: found._id || found.id,
            message: found.message,
            from:
              typeof found.from === "string" ? { _id: found.from } : found.from,
            attachments: (found as any).attachments,
            attachment: (found as any).attachments,
          };
        }
      }
      if (!tagged && selectedTag) tagged = selectedTag;

      const optimistic: ChatMessage = {
        id: tempId,
        tempId,
        conversationId: roomId,
        from: { _id: userId as string },
        message: text || "",
        ts: new Date().toISOString(),
        status: "sending",
        taggedMessage: tagged || undefined,
        attachments,
      } as ChatMessage;

      if (!options?.skipOptimistic) {
        setSentMessages((prev: any) => {
          const base = Array.isArray(prev) ? (prev as ChatMessage[]) : [];
          return [...base, optimistic];
        });
      }

      const payload = {
        id: tempId,
        roomId,
        message: text || "",
        from: userId,
        taggedMessage: selectedMessageId ? selectedMessageId : "",
        attachment: attachments,
      };

      console.log("payload: ", payload);

      let ackHandled = false;
      const ackTimeout = setTimeout(() => {
        if (!ackHandled) {
          setSentMessages((prev: any) => {
            if (!Array.isArray(prev)) return prev;
            return prev.map((m: any) =>
              m.id === tempId ? { ...m, status: "failed" } : m
            );
          });

          console.error("send-message ack timeout (message marked failed)");
        }
      }, 10000);

      emit("send-message", payload, (ack: any) => {
        ackHandled = true;
        clearTimeout(ackTimeout);

        if (!ack) {
          console.error("no ack from server");
          setSentMessages((prev: any) => {
            if (!Array.isArray(prev)) return prev;
            return prev.map((m: any) =>
              m.id === tempId ? { ...m, status: "failed" } : m
            );
          });
          return;
        }

        if (ack.status === "error") {
          console.error("send error:", ack.error);
          setSentMessages((prev: any) => {
            if (!Array.isArray(prev)) return prev;
            return prev.map((m: any) =>
              m.id === tempId ? { ...m, status: "failed" } : m
            );
          });
          return;
        }

        const serverPayload = ack.payload;
        const clientIdFromServer =
          serverPayload.clientId || serverPayload.tempId || tempId;

        const normalized: ChatMessage =
          serverPayload && typeof serverPayload.from === "string"
            ? {
                id: serverPayload.id || serverPayload._id,
                tempId: clientIdFromServer,
                conversationId: serverPayload.conversationId || roomId,
                from: { _id: serverPayload.from },
                message: serverPayload.message,
                ts: serverPayload.ts || new Date().toISOString(),
                status: serverPayload.status || "sent",
                attachments: serverPayload.attachments,
              }
            : { ...serverPayload, tempId: clientIdFromServer };

        setSentMessages((prev: any) => {
          if (!Array.isArray(prev)) return [normalized];
          const optimisticEntry = (prev as ChatMessage[]).find(
            (m: any) => m.id === tempId
          );
          const merged = {
            ...normalized,
            taggedMessage:
              (normalized as any).taggedMessage ??
              (optimisticEntry as any)?.taggedMessage,
            attachments:
              (normalized as any).attachments ??
              (optimisticEntry as any)?.attachments ??
              attachments,
          } as ChatMessage;
          return (prev as ChatMessage[]).map((m: ChatMessage) =>
            m.id === tempId ? merged : m
          );
        });

        console.log("sent-messages: ", sentMessages);
      });
    },
    [
      initialized,
      roomId,
      connected,
      selectedMessageId,
      selectedTag,
      sentMessages,
      emit,
      setSentMessages,
      userId,
    ]
  );

  return { sendMessage };
}
