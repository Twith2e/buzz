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
    <div className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col h-screen w-screen animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-transparent absolute top-0 w-full z-10">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <LucideX size={24} />
        </button>
      </div>

      {/* Main Content (Preview) */}
      <div className="flex-1 flex items-center justify-center relative bg-black/40">
        {previewUrl && (
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {isImage ? (
              <img
                src={previewUrl}
                alt="Status preview"
                className="max-h-[80vh] max-w-full object-contain mx-auto shadow-2xl"
              />
            ) : isVideo ? (
              <video
                src={previewUrl}
                controls
                className="max-h-full max-w-full object-contain mx-auto shadow-2xl"
              />
            ) : (
              <div className="text-white">Unsupported media type</div>
            )}
          </div>
        )}
      </div>

      {/* Footer (Caption & Send) */}
      <div className="bg-[#0b141a] p-3 flex justify-center">
        <div className="flex items-center gap-3 bg-[#0b141a] max-w-2xl w-full">
          {/* Input Box */}
          <div className="flex items-center gap-2 bg-[#2a3942] rounded-lg px-4 py-2 flex-1">
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <LucideSmile size={24} />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-20 left-4 z-50">
                <EmojiPicker
                  onEmojiClick={(e) => setCaption((prev) => prev + e.emoji)}
                  theme={"dark" as any}
                />
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowEmojiPicker(false)}
                ></div>
              </div>
            )}

            <input
              type="text"
              placeholder="Add a caption..."
              className="bg-transparent text-white flex-1 outline-none placeholder:text-gray-400 text-sm sm:text-base"
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
            className="bg-brandSky text-white p-3 rounded-full hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center"
          >
            <LucideSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusMediaPreview;
