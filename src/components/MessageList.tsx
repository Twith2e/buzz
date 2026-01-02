import { RefObject } from "react";
import Message from "./Message";
import { MessageSkeleton } from "./MessageSkeleton";
import type { ChatMessage } from "@/utils/types";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  roomId: string;
  currentUserId: string;
  contactList: any[];
  onMessageRightClick: (e: React.MouseEvent, message: any) => void;
  onTagClick: (messageId: string) => void;
  onReply?: (messageData: any) => void;
  containerRef: RefObject<HTMLDivElement>;
  registerMessageRef: (id: string) => any;
  enrichTaggedMessage: (tm: any) => any;
  currentConversation: any;
}

export function MessageList({
  messages,
  isLoading,
  roomId,
  currentUserId,
  contactList,
  onMessageRightClick,
  onTagClick,
  onReply,
  registerMessageRef,
  enrichTaggedMessage,
  currentConversation,
}: MessageListProps) {
  if (isLoading && roomId) {
    return <MessageSkeleton />;
  }

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <>
      {messages.map((m: any) => (
        <div
          key={m._id || m.id}
          data-id={m._id || m.id || m.ts}
          data-from={typeof m.from === "string" ? m.from : m.from?._id}
          data-ts={m.ts}
          ref={registerMessageRef(m._id || m.id || m.ts)}
        >
          <Message
            id={m._id || m.id || m.ts}
            message={m.message}
            isUser={
              typeof m.from === "string"
                ? m.from === currentUserId
                : m.from?._id === currentUserId
            }
            time={m.ts}
            status={m.status || ""}
            attachments={m.attachments}
            taggedMessage={
              m.taggedMessage ? enrichTaggedMessage(m.taggedMessage) : undefined
            }
            taggedUser={(() => {
              const ownerId =
                m.taggedMessage && typeof m.taggedMessage.from === "string"
                  ? m.taggedMessage.from
                  : m.taggedMessage?.from?._id;
              if (ownerId && ownerId === currentUserId) return "You";
              const ownerEmail =
                typeof m.taggedMessage?.from !== "string"
                  ? m.taggedMessage?.from?.email
                  : undefined;
              const match = (contactList || []).find(
                (c: any) =>
                  c.contactProfile?._id === ownerId ||
                  c._id === ownerId ||
                  (!!ownerEmail && c.email === ownerEmail)
              );
              if (match) return match.localName;
              return ownerEmail || ownerId || "";
            })()}
            taggedOwnerIsUser={(() => {
              const ownerId =
                m.taggedMessage && typeof m.taggedMessage.from === "string"
                  ? m.taggedMessage.from
                  : m.taggedMessage?.from?._id;
              return !!ownerId && ownerId === currentUserId;
            })()}
            onTagClick={() => {
              const taggedId =
                typeof m.taggedMessage === "object"
                  ? m.taggedMessage._id || m.taggedMessage.id
                  : null;

              if (taggedId) onTagClick(taggedId);
            }}
            onReply={onReply}
            handleRightClick={(e) => onMessageRightClick(e, m)}
            sender={
              currentConversation.title && currentConversation?.lastMessage.from
            }
          />
        </div>
      ))}
    </>
  );
}
