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
  // Sort messages by timestamp to ensure optimistic messages are grouped correctly
  const sortedMessages = [...messages].sort((a: any, b: any) => {
    const getTime = (m: any) => {
      const t = m?.ts || m?.createdAt || Date.now();
      const parsed = Date.parse(t as string);
      return isNaN(parsed) ? Date.now() : parsed;
    };
    return getTime(a) - getTime(b);
  });

  // Group messages by local date (YYYY-MM-DD) to avoid UTC offset issues
  const groups: { date: string; items: any[] }[] = [];
  const getLocalDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  for (const m of sortedMessages) {
    const d = new Date(m.ts || Date.now());
    const key = getLocalDateKey(d);
    const g = groups[groups.length - 1];
    if (!g || g.date !== key) {
      groups.push({ date: key, items: [m] });
    } else {
      g.items.push(m);
    }
  }

  const formatDateLabel = (isoDate: string) => {
    // isoDate is YYYY-MM-DD representing local date key
    const parts = isoDate.split("-").map((s) => parseInt(s, 10));
    const d =
      parts.length === 3
        ? new Date(parts[0], parts[1] - 1, parts[2])
        : new Date(isoDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, yesterday)) return "Yesterday";
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {groups.map((g) => (
        <div key={g.date}>
          <div className="flex items-center my-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <div className="px-3 text-xs text-gray-500">
              {formatDateLabel(g.date)}
            </div>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          {g.items.map((m: any) => (
            <div
              key={m._id || m.id}
              data-id={m._id || m.id || m.ts}
              data-from={typeof m.from === "string" ? m.from : m.from?._id}
              data-ts={m.ts}
              ref={registerMessageRef(m._id || m.id || m.ts)}
              className="mb-2"
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
                  m.taggedMessage
                    ? enrichTaggedMessage(m.taggedMessage)
                    : undefined
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
                  currentConversation.title &&
                  currentConversation?.lastMessage.from
                }
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
