import { formatTime } from "@/lib/utils";
import ImageAttachment from "@/components/ImageAttachment";
import {
  LucideCheck,
  LucideCheckCheck,
  LucideClock,
  LucideFile,
  LucideInfo,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import type { Message, TaggedMessage } from "@/utils/types";
import { useUserContext } from "@/contexts/UserContext";
import { IoDocumentText } from "react-icons/io5";
import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 60;

const Message = ({
  id,
  message,
  isUser,
  time,
  status,
  attachments,
  taggedMessage,
  taggedUser,
  taggedOwnerIsUser,
  handleRightClick,
  onTagClick,
  onReply,
  sender,
}: {
  id: string;
  message: string;
  isUser: boolean;
  time: string;
  status: string;
  attachments?: Array<{
    url: string;
    type?: string;
    format?: string;
    name?: string;
    size?: number;
    duration?: number;
    height?: number;
    width?: number;
  }>;
  taggedUser?: string;
  taggedMessage?: TaggedMessage | { message: string };
  taggedOwnerIsUser?: boolean;
  sender?: string;
  handleRightClick?: (e: React.MouseEvent) => void;
  onTagClick?: () => void;
  onReply?: (messageData: any) => void;
}) => {
  const { contactList } = useUserContext();
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef(0);
  const isSwiping = useRef(false);
  const [translateX, setTranslateX] = useState(0);

  if (sender) console.log(sender);

  const handleTouchStartLongPress = () => {
    touchTimeoutRef.current = setTimeout(() => {
      const mouseEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      const messageEl = document.querySelector(`[data-id="${id}"]`);
      if (messageEl) {
        messageEl.dispatchEvent(mouseEvent);
      }
    }, 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (translateX > 0) return;

    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
    handleTouchStartLongPress();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current) return;

    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;

    if (isUser) {
      if (deltaX > 0) return;
    } else {
      if (deltaX < 0) return;
    }

    setTranslateX(Math.min(Math.abs(deltaX), 90));
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    if (translateX > SWIPE_THRESHOLD) {
      onReply?.({ id, message, from: sender });
    }

    setTranslateX(0);
  };

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      onContextMenu={(e) => {
        e.preventDefault();
        handleRightClick?.(e);
      }}
    >
      <div
        data-id={id}
        className={`relative p-3 rounded-2xl max-w-[85%] md:max-w-[70%] lg:max-w-[60%] shadow-sm select-text transition-transform duration-150
      ${
        isUser
          ? "bg-[hsl(var(--chat-outgoing))] text-[hsl(var(--chat-outgoing-foreground))] rounded-br-none"
          : "bg-[hsl(var(--chat-incoming))] text-[hsl(var(--chat-incoming-foreground))] border border-border rounded-bl-none"
      }
    `}
        style={{ transform: `translateX(${isUser ? "-" : ""}${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {taggedMessage && (
          <div
            className={`bg-black/10 dark:bg-white/10 px-3 py-2 rounded-lg mb-2 flex items-start gap-3 w-full cursor-pointer transition-colors hover:bg-black/20 dark:hover:bg-white/20`}
            role="note"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick && onTagClick();
            }}
          >
            <div
              className={`w-1 self-stretch rounded-full ${
                taggedOwnerIsUser ? "bg-emerald-400" : "bg-sky-400"
              }`}
            />
            <div className="flex flex-col overflow-hidden w-full">
              <span className="text-[11px] font-semibold opacity-90 mb-0.5">
                {taggedUser || "You"}
              </span>

              {(() => {
                const ra =
                  (taggedMessage as any)?.attachments ||
                  (taggedMessage as any)?.attachment;

                if (ra && Array.isArray(ra) && ra.length > 0) {
                  return (
                    <div className="flex gap-1 mb-1 overflow-x-auto scrollbar-hide py-1">
                      {ra.slice(0, 3).map((a: any, i: number) => {
                        const url: string = a.url;
                        const fmt: string | undefined = a.format;
                        const isImage =
                          /^(jpg|jpeg|png|gif|webp)$/i.test(fmt || "") ||
                          /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(url);
                        const isVideo =
                          /^(mp4|webm|ogg)$/i.test(fmt || "") ||
                          /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
                        return (
                          <div
                            key={i}
                            className="w-16 h-12 shrink-0 rounded overflow-hidden bg-black/20"
                          >
                            {isImage ? (
                              <img
                                src={url}
                                alt={a.name || "media"}
                                className="w-full h-full object-cover"
                              />
                            ) : isVideo ? (
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full text-[8px] flex items-center justify-center text-current/70">
                                DOC
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return null;
              })()}

              <span className="text-xs truncate opacity-80">
                {taggedMessage.message}
              </span>
            </div>
          </div>
        )}

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {(attachments || []).map(
              (a: Message["attachments"][number], i: number) => {
                const url: string = a.url;
                const fmt: string | undefined = a.format;
                const t: string | undefined = fmt
                  ? /^(jpg|jpeg|png|gif|webp)$/i.test(fmt)
                    ? "image"
                    : /^(mp4|webm|ogg)$/i.test(fmt)
                    ? "video"
                    : "doc"
                  : /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(url)
                  ? "image"
                  : /\.(mp4|webm|ogg)(\?|#|$)/i.test(url)
                  ? "video"
                  : "doc";

                return (
                  <div key={i} className="">
                    {t === "image" ? (
                      <ImageAttachment
                        url={url}
                        alt={a.fileName || "attachment"}
                        className="max-w-[280px] max-h-[300px] w-auto h-auto rounded-lg object-contain bg-black/5"
                      />
                    ) : t === "video" ? (
                      <video
                        src={url}
                        controls
                        className="max-w-[280px] max-h-[300px] rounded-lg"
                      />
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-black/5 hover:bg-black/10 transition-colors text-sm"
                      >
                        {a.format === "pdf" ? (
                          <FaFilePdf size={18} className="opacity-70" />
                        ) : a.format === "docx" || a.format === "doc" ? (
                          <IoDocumentText size={18} className="opacity-70" />
                        ) : (
                          <LucideFile size={18} className="opacity-70" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[140px]">
                            {a.fileName || "Document"}
                          </span>
                          {a.size && (
                            <span className="text-[10px] opacity-70">
                              {((a.size as number) / 1024).toFixed(1)} KB
                            </span>
                          )}
                        </div>
                      </a>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}

        {message && message.trim().length > 0 && (
          <div className="flex flex-col relative z-10">
            {sender && !isUser && (
              <span className="text-[11px] font-bold text-orange-500 mb-1">
                {contactList.find((u) => u.contactProfile._id === sender)
                  ?.localName || sender}
              </span>
            )}
            <span className="block wrap-break-word whitespace-pre-wrap leading-relaxed mr-14 text-[15px] mb-2">
              {message}
            </span>
          </div>
        )}

        {/* Time + Ticks */}
        <div className="absolute bottom-1 right-2 flex gap-1 items-center select-none">
          <span className="text-[10px] opacity-70 tabular-nums tracking-wide">
            {formatTime(time)}
          </span>
          {isUser && (
            <span className="ml-1">
              {status === "sending" ? (
                <LucideClock size={12} className="opacity-70" />
              ) : status === "sent" ? (
                <LucideCheck size={13} className="opacity-70" />
              ) : status === "delivered" || status === "read" ? (
                <LucideCheckCheck
                  size={13}
                  className={`${
                    status === "read"
                      ? "text-sky-300 dark:text-sky-400"
                      : "opacity-70"
                  }`}
                />
              ) : (
                <LucideInfo size={12} className="opacity-70" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
