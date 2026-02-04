import { useConversationContext } from "@/contexts/ConversationContext";
import {
  LucideCheck,
  LucideRotateCcw,
  LucideCrop,
  LucideX,
  LucideTrash2,
  LucideSmile,
  LucideFile,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactCrop, { PercentCrop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent } from "./ui/dialog";
import EmojiPicker from "emoji-picker-react";
import useReadObserver from "@/hooks/useReadObserver";
import { useUserContext } from "@/contexts/UserContext";
import { useSocketContext } from "@/contexts/SocketContext";
import { useSendMessage } from "@/hooks/useSendMessage";
import {
  getCloudinarySignature,
  uploadFileToCloudinary,
} from "@/utils/cloudinary";
import {
  convertBytesToKb,
  getCroppedBlobFromImage,
  makeClientId,
} from "@/lib/utils";
import { LuSendHorizontal } from "react-icons/lu";

const SelectedFilePreview = ({ fileType }: { fileType: "media" | "doc" }) => {
  const emojiRef = useRef<HTMLDivElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<PercentCrop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [edited, setEdited] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [message, setMessage] = useState({
    attachment: null,
    text: "",
  });
  const [selectedTag, setSelectedTag] = useState<{
    id: string;
    message: string;
    from: any;
  } | null>(null);

  const { selectedImage, setSelectedImage, selectedDoc, setSelectedDoc } =
    useConversationContext();
  const { user, isAreaClicked, setIsAreaClicked } = useUserContext();
  const { emit, connected } = useSocketContext();
  const {
    roomId,
    initialized,
    selectedMessageId,
    setSelectedMessageId,
    sentMessages,
    setSentMessages,
    setConversations,
  } = useConversationContext();
  const { sendMessage } = useSendMessage({
    emit,
    roomId,
    userId: user?._id,
    connected,
    initialized,
    selectedMessageId,
    selectedTag,
    sentMessages,
    setSentMessages,
    setConversations,
  });
  const { containerRef } = useReadObserver({ emit, userId: user?._id, roomId });
  const idx =
    fileType === "doc"
      ? (selectedDoc?.currentIndex ?? 0)
      : (selectedImage?.currentIndex ?? 0);
  const file =
    fileType === "doc"
      ? (selectedDoc?.docs?.[idx] ?? null)
      : (selectedImage?.images?.[idx] ?? null);
  const files =
    fileType === "doc"
      ? Array.isArray(selectedDoc?.docs)
        ? (selectedDoc!.docs as Array<File>)
        : []
      : Array.isArray(selectedImage?.images)
        ? (selectedImage!.images as Array<File>)
        : [];

  const originalsRef = useRef<Map<number, File>>(new Map());

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    if (!originalsRef.current.has(idx)) {
      originalsRef.current.set(idx, file);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, idx]);

  const isImage = useMemo(
    () => !!file && file.type.startsWith("image/"),
    [file],
  );
  const isVideo = useMemo(
    () => !!file && file.type.startsWith("video/"),
    [file],
  );

  const onCropChange = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
    if (!edited) setEdited(true);
  };

  const onCropComplete = (px: PixelCrop, _pc: PercentCrop) => {
    setCompletedCrop(px);
  };

  const applyCrop = async () => {
    if (!file || !previewUrl || !completedCrop || !isImage || !imgRef.current)
      return;
    const blob = await getCroppedBlobFromImage(imgRef.current, completedCrop);
    const nextName = file.name.replace(/(\.[^.]+)$/i, "-cropped$1");
    const nextFile = new File([blob], nextName, { type: file.type });
    setSelectedImage((prev) => {
      const imgs = Array.isArray(prev.images) ? [...prev.images] : [];
      imgs[idx] = nextFile;
      return { images: imgs, currentIndex: idx };
    });
    setEdited(false);
    setCropping(false);
  };

  const revertCrop = () => {
    const original = originalsRef.current.get(idx);
    if (!original) {
      setCropping(false);
      return;
    }
    setSelectedImage((prev) => {
      const imgs = Array.isArray(prev.images) ? [...prev.images] : [];
      imgs[idx] = original;
      return { images: imgs, currentIndex: idx };
    });
    setEdited(false);
    setCropping(false);
  };

  return (
    <div className="space-y-3">
      <Dialog open={cropping} onOpenChange={setCropping}>
        <DialogContent hideClose className="w-full max-w-[90vw] h-fit p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              className="px-2 py-1 rounded bg-emerald-500 text-white disabled:bg-gray-300"
              disabled={!edited}
              onClick={applyCrop}
            >
              <LucideCheck size={16} />
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded bg-gray-200"
              onClick={() => setCropping(false)}
            >
              <LucideX size={16} />
            </button>
          </div>
          {fileType === "media" && isImage && previewUrl && (
            <div className="relative w-full max-h-[80vh] bg-black/5 rounded overflow-hidden">
              <ReactCrop
                crop={crop}
                aspect={4 / 3}
                onChange={onCropChange}
                onComplete={onCropComplete}
              >
                <img
                  ref={imgRef}
                  src={previewUrl ?? ""}
                  alt=""
                  className="max-w-[90vw] max-h-[80vh] w-auto h-auto object-contain"
                />
              </ReactCrop>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center">
        {fileType === "media" && isImage && !cropping && (
          <button
            type="button"
            className="px-2 py-1 rounded hover:bg-gray-500"
            onClick={() => {
              setEdited(false);
              setCropping(true);
            }}
          >
            <LucideCrop size={18} color="white" />
          </button>
        )}
        {fileType === "media" && isImage && (
          <button
            type="button"
            className="px-2 py-1 rounded hover:bg-gray-500"
            onClick={revertCrop}
            disabled={
              !originalsRef.current.get(idx) ||
              originalsRef.current.get(idx) === file
            }
            title="Revert to original"
          >
            <LucideRotateCcw size={18} color="white" />
          </button>
        )}
        <button
          type="button"
          className="ml-auto px-2 py-1 rounded hover:bg-gray-500"
          onClick={() => {
            setSelectedImage({ images: null, currentIndex: null });
            setSelectedDoc({ docs: null, currentIndex: null });
          }}
          title="Close preview"
        >
          <LucideTrash2 size={18} color="white" />
        </button>
      </div>

      {fileType === "media" && isImage && previewUrl && !cropping && (
        <div className="relative w-full h-64 bg-black/5 rounded overflow-hidden">
          <img
            src={previewUrl ?? ""}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {fileType === "media" && isVideo && (
        <div className="relative w-full h-64 bg-black/5 rounded overflow-hidden">
          <video
            src={previewUrl ?? ""}
            controls
            className="w-full h-full object-contain"
          />
        </div>
      )}
      {fileType === "media" && files.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto py-1">
          {files.map((f, i) => {
            const url = URL.createObjectURL(f);
            const isImg = f.type.startsWith("image/");
            const isVid = f.type.startsWith("video/");
            return (
              <button
                key={i}
                type="button"
                className={`border rounded overflow-hidden ${
                  i === idx ? "border-emerald-500" : "border-gray-300"
                }`}
                onClick={() =>
                  setSelectedImage({ images: files, currentIndex: i })
                }
                title={f.name}
              >
                {isImg ? (
                  <img
                    src={url}
                    alt={f.name}
                    className="w-16 h-16 object-cover"
                  />
                ) : isVid ? (
                  <video src={url} className="w-16 h-16 object-cover" />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center text-xs">
                    doc
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
      {fileType === "doc" && (
        <div className="text-sm flex flex-col items-center justify-center h-fit space-y-2">
          <LucideFile size={40} />
          <span>{file?.name || ""}</span>
          <span>{convertBytesToKb(file?.size)} KB</span>
        </div>
      )}
      <form
        className="border-t border-brandSky px-2 flex items-center h-8 bg-white rounded-sm"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: containerRef.current.scrollHeight || 0,
              behavior: "smooth",
            });
          }
          if (!files || files.length === 0) return;
          const tempId = makeClientId();
          const optimisticAttachments = files.map((f) => {
            const mime = f.type || "";
            const ext =
              (f.name || "").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
            const resourceType = mime.startsWith("image/")
              ? "image"
              : mime.startsWith("video/")
                ? "video"
                : ext === "pdf" ||
                    ext === "csv" ||
                    ext === "txt" ||
                    ext === "doc" ||
                    ext === "docx" ||
                    ext === "ppt" ||
                    ext === "pptx" ||
                    ext === "xls" ||
                    ext === "xlsx"
                  ? "raw"
                  : "raw";
            return {
              url: URL.createObjectURL(f),
              originalFilename: f.name,
              bytes: f.size,
              format: ext,
              resourceType,
            };
          });
          // local optimistic add (do not emit yet)
          setSentMessages((prev: any) => {
            const base = Array.isArray(prev) ? prev : [];
            return [
              ...base,
              {
                id: tempId,
                tempId,
                conversationId: roomId,
                from: { _id: user?._id },
                message: message.text || "",
                ts: new Date().toISOString(),
                status: "sending",
                attachments: optimisticAttachments,
              },
            ];
          });

          // Optimistic update for conversation list (since skipOptimistic is true in sendMessage)
          setConversations((prev: any) => {
            if (!prev) return prev;
            const targetIndex = prev.findIndex(
              (c: any) => c.roomId === roomId || c._id === roomId,
            );
            if (targetIndex === -1) return prev;

            const updatedConversation = {
              ...prev[targetIndex],
              lastMessage: {
                _id: tempId,
                conversation: roomId,
                from: user?._id,
                message: message.text || "",
                ts: new Date().toISOString(),
                status: "sending",
                attachments: optimisticAttachments,
              },
              updatedAt: new Date().toISOString(),
            };

            const newConversations = [...prev];
            newConversations.splice(targetIndex, 1);
            newConversations.unshift(updatedConversation);

            return newConversations;
          });

          // upload all to Cloudinary then send final using same tempId
          (async () => {
            try {
              const uploaded = [] as Array<{
                url: string;
                originalFilename?: string;
                bytes?: number;
                publicId?: string;
                resourceType?: string;
                format?: string;
                width?: number;
                height?: number;
              }>;
              for (const f of files) {
                const kind: "image" | "video" | "doc" = f.type.startsWith(
                  "image/",
                )
                  ? "image"
                  : f.type.startsWith("video/")
                    ? "video"
                    : "doc";
                const sign = await getCloudinarySignature(`chats/${roomId}`);
                const data = await uploadFileToCloudinary(f, sign);
                const url: string = data.secure_url || data.url;
                uploaded.push({
                  url,
                  originalFilename: data.original_filename,
                  bytes: data.bytes,
                  resourceType: data.resource_type,
                  format: data.format,
                  height: data.height,
                  width: data.width,
                  publicId: data.public_id,
                });
              }
              // emit via hook and merge with optimistic (same tempId), but skip optimistic append
              sendMessage(message.text, uploaded, tempId, {
                skipOptimistic: true,
              });
            } catch (err) {
              console.error("upload failed", err);
            }
          })();
          setMessage({ attachment: null, text: "" });
          setSelectedMessageId(null);
          setSelectedTag(null);
          if (fileType === "doc") {
            setSelectedDoc({ docs: null, currentIndex: null });
          } else {
            setSelectedImage({ images: null, currentIndex: null });
          }
        }}
      >
        <div className="flex items-center gap-5 pr-5">
          <button
            className={`p-1 rounded-md cursor-pointer hover:bg-sky-300 hover:text-white grow-0`}
            onClick={(e) => {
              e.stopPropagation();
              setIsAreaClicked(!isAreaClicked);
            }}
            type="button"
          >
            <LucideSmile size={20} color="black" />
          </button>
          <div
            ref={emojiRef}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`-bottom-[145px] fixed transition-transform duration-500 ease-in-out ${
              isAreaClicked ? "translate-y-100" : "-translate-y-50"
            }`}
          >
            <EmojiPicker
              autoFocusSearch
              lazyLoadEmojis={false}
              onEmojiClick={(e) => {
                setMessage((prev) => ({ ...prev, text: prev.text + e.emoji }));
              }}
            />
          </div>
        </div>
        <input
          type="text"
          className="text-black grow px-2 py-1 h-full outline-none placeholder:text-gray-400"
          placeholder="Type a message"
          value={message.text || ""}
          onChange={(e) =>
            setMessage((prev) => ({ ...prev, text: e.target.value }))
          }
        />
        <button
          aria-label="send message button"
          className="ml-2"
          disabled={!initialized || !connected || files.length === 0}
        >
          <LuSendHorizontal size={24} color="#222" />
        </button>
      </form>
    </div>
  );
};

export default SelectedFilePreview;
