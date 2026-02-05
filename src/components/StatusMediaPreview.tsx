import { LucideX, LucideSend, LucideSmile } from "lucide-react";
import { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";

interface StatusMediaPreviewProps {
  file: File;
  onClose: () => void;
  onSend: (file: File, caption: string) => void;
}

const StatusMediaPreview = ({
  file,
  onClose,
  onSend,
}: StatusMediaPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="fixed inset-0 z-100 bg-[#0b141a] flex flex-col h-dvh w-screen animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 bg-linear-to-b from-black/60 to-transparent absolute top-0 w-full z-20">
        <button
          onClick={onClose}
          className="p-2 sm:p-3 rounded-full hover:bg-white/10 text-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center bg-black/20 backdrop-blur-md"
        >
          <LucideX size={window.innerWidth < 640 ? 20 : 24} />
        </button>
      </div>

      {/* Main Content (Preview) */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-2 sm:px-4 pt-16 pb-24">
        {previewUrl && (
          <div className="relative w-full h-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isImage ? (
              <img
                src={previewUrl}
                alt="Status preview"
                className="max-h-full max-w-full object-contain mx-auto shadow-2xl rounded-sm sm:rounded-md transition-all duration-300"
              />
            ) : isVideo ? (
              <video
                src={previewUrl}
                controls
                className="max-h-full max-w-full object-contain mx-auto shadow-2xl rounded-sm sm:rounded-md"
              />
            ) : (
              <div className="text-white/60 font-medium bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
                Unsupported media type
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer (Caption & Send) */}
      <div className="bg-linear-to-t from-black/80 to-transparent p-4 sm:p-6 pb-6 sm:pb-8 flex justify-center absolute bottom-0 w-full z-20">
        <div className="flex items-center gap-2 sm:gap-4 max-w-2xl w-full">
          {/* Input Box */}
          <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex-1 transition-all focus-within:border-sky-500/50 focus-within:bg-white/15">
            <div className="relative">
              <button
                className={`text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95 ${showEmojiPicker ? "text-sky-400" : ""}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <LucideSmile size={22} />
              </button>

              {showEmojiPicker && (
                <div className="fixed sm:absolute bottom-24 left-4 right-4 sm:left-0 sm:right-auto sm:bottom-16 z-110 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#1F2C33]">
                    <EmojiPicker
                      onEmojiClick={(e) => setCaption((prev) => prev + e.emoji)}
                      theme={"dark" as any}
                      skinTonesDisabled
                      width={window.innerWidth < 640 ? "100%" : 350}
                      height={400}
                    />
                  </div>
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowEmojiPicker(false)}
                  ></div>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Add a caption..."
              className="bg-transparent text-white flex-1 outline-none placeholder:text-white/40 text-[15px] sm:text-[16px]"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend(file, caption);
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => onSend(file, caption)}
            className="bg-sky-500 text-white p-3.5 sm:p-4 rounded-full hover:bg-sky-400 transition-all hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center shrink-0"
          >
            <LucideSend size={20} className="sm:size-[22px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusMediaPreview;
