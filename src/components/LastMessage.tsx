import { Conversation } from "@/utils/types";
import {
  LucideFile,
  LucideImage,
  LucideVideo,
  LucideAudioLines,
} from "lucide-react";

const LastMessage = ({ message }: { message: Conversation["lastMessage"] }) => {
  let type: string;

  if (
    message.attachments &&
    message.attachments.length > 0 &&
    (message.attachments[message.attachments.length - 1].format === "jpg" ||
      message.attachments[message.attachments.length - 1].format === "png" ||
      message.attachments[message.attachments.length - 1].format === "webp")
  ) {
    type = "image";
  } else if (
    message.attachments &&
    message.attachments.length > 0 &&
    message.attachments[message.attachments.length - 1].format === "mp4"
  ) {
    type = "video";
  } else if (
    message.attachments &&
    message.attachments.length > 0 &&
    (message.attachments[message.attachments.length - 1].format === "pdf" ||
      message.attachments[message.attachments.length - 1].format === "doc" ||
      message.attachments[message.attachments.length - 1].format === "docx")
  ) {
    type = "document";
  } else if (
    message.attachments &&
    message.attachments.length > 0 &&
    message.attachments[message.attachments.length - 1].format === "webm"
  ) {
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
