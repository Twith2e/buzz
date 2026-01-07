import { LuSendHorizontal } from "react-icons/lu";
import {
  LucideSmile,
  LucideMic,
  LucideX,
  LucideStopCircle,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import FileModal from "./FileModal";
import { RefObject, useState, useEffect } from "react";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import VoiceWaveform from "./VoiceWaveform";
import { makeClientId } from "@/lib/utils";
import { useTypingContext } from "@/contexts/TypingContext";

interface ChatFormProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  openShare: boolean;
  onOpenShareChange: (open: boolean) => void;
  isAreaClicked: boolean;
  onIsAreaClickedChange: (clicked: boolean) => void;
  emojiRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLInputElement>;
  isDisabled: boolean;
  replyMessage: any;
  onClearReply: () => void;
  onSendVN: (audio: Blob) => void;
}

export function ChatForm({
  message,
  onMessageChange,
  onSubmit,
  openShare,
  onOpenShareChange,
  isAreaClicked,
  onIsAreaClickedChange,
  emojiRef,
  inputRef,
  isDisabled,
  replyMessage,
  onClearReply,
  onSendVN,
}: ChatFormProps) {
  const { start, stop, recording } = useVoiceRecorder();
  const { setUserTyping } = useTypingContext();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  // Track typing state: set to true when message changes, auto-stop after 3s of inactivity
  const handleMessageChange = (value: string) => {
    onMessageChange(value);

    if (value.length > 0) {
      setUserTyping(true);
    }
  };

  useEffect(() => {
    // Stop typing when message is sent
    if (message.length === 0) {
      setUserTyping(false);
    }
  }, [message, setUserTyping]);

  const handleMicToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recording) {
      try {
        await start();
      } catch (err) {
        console.error("start recording failed", err);
      }
      return;
    }

    try {
      const blob = await stop();
      if (!blob) return;
      setPreviewBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("stop recording failed", err);
    }
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
  };
  return (
    <div className="w-full z-10 bg-background border-t">
      {replyMessage && (
        <div className="px-2 py-1 bg-gray-100 border-t border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-start gap-2 overflow-hidden">
            <div className="w-1 h-8 bg-emerald-400 rounded-sm" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-600">Replying to</span>
              {(() => {
                const ra =
                  (replyMessage as any)?.attachment ||
                  (replyMessage as any)?.attachments;

                return ra && ra.length > 0 ? (
                  <div className="flex gap-1 mt-1">
                    {ra.slice(0, 3).map((a: any, i: number) => {
                      const isVideo = /^(mp4|webm|ogg)$/i.test(a.format || "");
                      const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(
                        a.format || ""
                      );
                      return (
                        <div
                          key={i}
                          className="w-10 h-10 rounded overflow-hidden"
                        >
                          {isImage ? (
                            <img
                              src={a.url}
                              alt={a.name || "media"}
                              className="w-10 h-10 object-cover"
                            />
                          ) : isVideo ? (
                            <video
                              src={a.url}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 text-[10px] flex items-center justify-center bg-gray-200 text-gray-600">
                              DOC
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null;
              })()}
              <span className="text-sm text-gray-800 truncate w-full">
                {replyMessage.message}
              </span>
            </div>
          </div>
          <button
            className="text-gray-500 text-sm px-2 cursor-pointer"
            onClick={onClearReply}
          >
            <LucideX size={14} />
          </button>
        </div>
      )}
      <form
        className="border-t border-sky-300 px-4 flex items-center h-14 bg-background w-full"
        onSubmit={onSubmit}
      >
        <div className="flex items-center gap-5 pr-5">
          <button
            className={`p-1 rounded-md cursor-pointer hover:bg-sky-300 hover:text-white grow-0`}
            onClick={(e) => {
              e.stopPropagation();
              onIsAreaClickedChange(!isAreaClicked);
            }}
            type="button"
          >
            <LucideSmile size={20} />
          </button>
          <div
            ref={emojiRef}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`-bottom-[145px] fixed transition-transform duration-500 ease-in-out bg-background z-50 ${
              isAreaClicked ? "translate-y-100" : "-translate-y-50"
            }`}
          >
            <EmojiPicker
              className="bg-background"
              autoFocusSearch
              lazyLoadEmojis={true}
              onEmojiClick={(e) => {
                onMessageChange(message + e.emoji);
              }}
            />
          </div>
          <FileModal openShare={openShare} setOpenShare={onOpenShareChange} />
        </div>
        <input
          type="text"
          className="text-foreground grow px-2 py-1 h-full outline-none placeholder:text-gray-400"
          placeholder="Type a message"
          value={message || ""}
          ref={inputRef}
          onChange={(e) => handleMessageChange(e.target.value)}
        />
        {message ? (
          <button
            aria-label="send message button"
            className="ml-2"
            disabled={isDisabled}
          >
            <LuSendHorizontal size={24} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMicToggle}
            className={`transition ${recording ? "text-red-500" : ""}`}
          >
            <LucideMic size={24} />
          </button>
        )}
        {previewUrl && (
          <div className="flex items-center gap-3 px-4 py-2 border-t bg-background">
            <VoiceWaveform src={previewUrl} height={32} />

            <button
              onClick={clearPreview}
              className="text-red-500"
              type="button"
            >
              <LucideX />
            </button>

            <button
              onClick={async () => {
                if (!previewBlob) return;
                onSendVN(previewBlob);
                clearPreview();
              }}
              className="ml-auto text-sky-600"
              type="button"
            >
              <LuSendHorizontal size={22} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
