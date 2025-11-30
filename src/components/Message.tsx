import { formatTime } from "@/lib/utils";
import {
  LucideCheck,
  LucideCheckCheck,
  LucideClock,
  LucideInfo,
} from "lucide-react";
import type { TaggedMessage } from "@/utils/types";

const Message = ({
  message,
  isUser,
  time,
  status,
  taggedMessage,
  taggedUser,
  taggedOwnerIsUser,
  handleRightClick,
  onTagClick,
}: {
  message: string;
  isUser: boolean;
  time: string;
  status: string;
  taggedUser?: string;
  taggedMessage?: TaggedMessage | { message: string };
  taggedOwnerIsUser?: boolean;
  handleRightClick?: (e: React.MouseEvent) => void;
  onTagClick?: () => void;
}) => {
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
            className={`bg-white text-[#222] px-2 py-1 rounded mb-2 flex items-start gap-2 max-w-[80%] cursor-pointer`}
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
              <span className="text-[10px] opacity-70">
                {taggedUser || "YOU"}
              </span>
              <span className="text-xs truncate">{taggedMessage.message}</span>
            </div>
          </div>
        )}
        <span className="block wrap-break-word pr-12 mb-4 leading-relaxed">
          {message}
        </span>

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
