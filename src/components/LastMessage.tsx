import { Conversation } from "@/utils/types";
import {
  LucideFile,
  LucideImage,
  LucideVideo,
  LucideAudioLines,
} from "lucide-react";

const LastMessage = ({ message }: { message: Conversation["lastMessage"] }) => {
  let type: string;

  const lastAttachment = message.attachments?.[message.attachments.length - 1];
  const format = lastAttachment?.format?.toLowerCase() || "";
  const resourceType = lastAttachment?.resourceType?.toLowerCase() || "";

  if (
    resourceType === "image" ||
    format === "jpg" ||
    format === "jpeg" ||
    format === "png" ||
    format === "webp" ||
    format === "gif"
  ) {
    type = "image";
  } else if (
    resourceType === "video" ||
    format === "mp4" ||
    format === "webm" ||
    format === "mov" ||
    format === "avi"
  ) {
    type = "video";
  } else if (
    format === "pdf" ||
    format === "doc" ||
    format === "docx" ||
    format === "xlsx" ||
    format === "xls" ||
    format === "csv" ||
    format === "ppt" ||
    format === "pptx"
  ) {
    type = "document";
  } else if (format === "webm" || format === "mp3" || format === "wav") {
    type = "audio";
  } else {
    type = "text";
  }

  const defaultText =
    type === "image"
      ? "Image"
      : type === "video"
        ? "Video"
        : type === "audio"
          ? "Audio"
          : type === "document"
            ? "Document"
            : "";

  return (
    <span className="text-xs text-[#AAA] flex items-center gap-1 shrink-0">
      {type === "image" ? (
        <LucideImage size={12} />
      ) : type === "video" ? (
        <LucideVideo size={12} />
      ) : type === "audio" ? (
        <LucideAudioLines size={12} />
      ) : (
        type === "document" && <LucideFile size={12} />
      )}
      {message.message ? message.message : defaultText}
    </span>
  );
};

export default LastMessage;
