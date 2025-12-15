import { formatTime } from "@/lib/utils";
import {
  LucideCheck,
  LucideCheckCheck,
  LucideClock,
  LucideInfo,
} from "lucide-react";
import type { TaggedMessage } from "@/utils/types";
import { useUserContext } from "@/contexts/UserContext";

const Message = ({
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
  sender,
}: {
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
}) => {
  const { contactList } = useUserContext();
  if (sender) console.log(sender);

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
      onContextMenu={(e) => {
        e.preventDefault();
        handleRightClick?.(e);
      }}
    >
      <div
        className={`relative p-3 rounded-2xl 
      ${isUser ? "bg-emerald-100 text-stone-900" : "bg-emerald-400 text-white"}
    `}
        style={{
          borderBottomRightRadius: isUser ? "6px" : "16px",
          borderBottomLeftRadius: isUser ? "16px" : "6px",
        }}
      >
        {taggedMessage && (
          <div
            className={`bg-white text[#222] px-2 py-1 rounded mb-2 flex items-start gap-2 max-w-[80%] cursor-pointer`}
            role="note"
            onClick={(e) => {
              e.stopPropagation();
              onTagClick && onTagClick();
            }}
          >
            <div
              className={`w-1 h-8 rounded-sm ${
                taggedOwnerIsUser ? "bg-emerald-500" : "bg-blue-500"
              }`}
            />
            <div className="flex flex-col overflow-hidden">
              {(() => {
                const ra =
                  (taggedMessage as any)?.attachments ||
                  (taggedMessage as any)?.attachment;
                if (!ra || !Array.isArray(ra) || ra.length === 0) return null;
                return (
                  <div className="flex gap-1 mb-1">
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
                          className="w-[160px] h-[80px] rounded overflow-hidden"
                        >
                          {isImage ? (
                            <img
                              src={url}
                              alt={a.name || "media"}
                              className="w-[160px] h-20 object-cover"
                            />
                          ) : isVideo ? (
                            <video src={url} className="w-8 h-8 object-cover" />
                          ) : (
                            <div className="w-8 h-8 text-[8px] flex items-center justify-center bg-gray-200 text-gray-600">
                              {a.name || a.filename || a.fileName || "Document"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              <span className="text-[10px] opacity-70">
                {taggedUser || "You"}
              </span>
              <span className="text-xs truncate">{taggedMessage.message}</span>
            </div>
          </div>
        )}
        {/* Attachments (image/video) */}
        {attachments && attachments.length > 0 && (
          <div className="mb-2">
            {(attachments || []).map((a: any, i: number) => {
              const url: string = a.url;
              const fmt: string | undefined = a.format;
              const t: string | undefined = a.type
                ? a.type
                : fmt
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
                <div key={i} className="mb-2">
                  {t === "image" ? (
                    <img
                      src={url}
                      alt={a.name || "attachment"}
                      className="max-w-[260px] max-h-[180px] rounded"
                    />
                  ) : t === "video" ? (
                    <video
                      src={url}
                      controls
                      className="max-w-[260px] max-h-[180px] rounded"
                    />
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-white text-xs text-gray-700"
                    >
                      <span>
                        {a.name || a.filename || a.fileName || "Document"}
                      </span>
                      {(a.size ?? a.bytes) && (
                        <span>
                          {(((a.size ?? a.bytes) as number) / 1024).toFixed(1)}{" "}
                          KB
                        </span>
                      )}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {message && message.trim().length > 0 && (
          <div className="flex flex-col">
            <span className="text-black text-xs">
              {sender &&
                !isUser &&
                contactList.find((u) => u.contactProfile._id === sender)
                  ?.localName}
            </span>
            <span className="block wrap-break-word pr-12 mb-4 leading-relaxed">
              {message}
            </span>
          </div>
        )}

        {/* Time + ticks (WhatsApp-style bottom right) */}
        <div className="absolute bottom-2 right-2 flex gap-3 items-center text-[10px] opacity-70">
          <span>{formatTime(time)}</span>
          <span>
            {isUser &&
              (status === "sending" ? (
                <LucideClock size={14} className="text-[#555]" />
              ) : status === "sent" ? (
                <LucideCheck size={14} className="text-[#555]" />
              ) : status === "delivered" || status === "read" ? (
                <LucideCheckCheck
                  size={16}
                  className={`${
                    status === "delivered"
                      ? "text-[#555] font-black"
                      : "text-blue-500 font-extrabold"
                  }`}
                />
              ) : (
                <LucideInfo size={14} className="text-[#555]" />
              ))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;
