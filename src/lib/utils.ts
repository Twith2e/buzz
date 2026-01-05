import { Contact, Conversation, Participant } from "@/utils/types";
import { clsx, type ClassValue } from "clsx";
import { PixelCrop } from "react-image-crop";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a time string to time-of-day (HH:mm) in the user's local timezone.
 * Accepts ISO/RFC strings or epoch millis (as string); returns input on parse failure.
 */
export function formatTime(time: string): string {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatRelativeTime(time: string): string {
  const date = new Date(time);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  return formatTime(time);
}

export function makeClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (w) =>
    w.replace(/^\w/, (c) => c.toUpperCase())
  );
}

/**
 * Formats raw attachment payloads from server into UI-ready descriptors.
 * Returns extended metadata with `format` while inferring a display `type` for UI when needed.
 */

export function formatAttachments(att: any): Array<{
  format: string;
  url: string;
  name?: string;
  size?: number;
  duration?: number;
  filename?: string;
  height?: number;
  width?: number;
}> {
  if (!att || !Array.isArray(att)) return [];
  const inferExt = (url: string): string => {
    const u = (url || "").toLowerCase();
    const m = u.match(/\.([a-z0-9]+)(\?|#|$)/);
    return m ? m[1] : "";
  };
  const inferType = (url: string): "image" | "video" | "doc" => {
    const u = (url || "").toLowerCase();
    if (/(\.jpg|\.jpeg|\.png|\.gif|\.webp)(\?|#|$)/.test(u)) return "image";
    if (/(\.mp4|\.webm|\.ogg)(\?|#|$)/.test(u)) return "video";
    return "doc";
  };
  return att
    .map((a: any) => {
      if (!a) return null;
      if (typeof a === "string") {
        const url = a;
        const format = inferExt(url);
        return { format, url } as any;
      }
      const url = a.url || a.secure_url || "";
      const format: string = a.format || inferExt(url);
      const name = a.name ?? a.filename;
      const size = a.size;
      const duration = a.duration;
      const filename = a.filename;
      const height = a.height;
      const width = a.width;
      // Include `type` for UI consumption while returning the requested shape
      const type = (a.type as any) || inferType(url);
      return {
        format,
        url,
        name,
        size,
        duration,
        filename,
        height,
        width,
        type,
      } as any;
    })
    .filter(Boolean) as Array<{
    format: string;
    url: string;
    name?: string;
    size?: number;
    duration?: number;
    filename?: string;
    height?: number;
    width?: number;
  }>;
}

export function convertBytesToKb(bytes: number): number {
  return Number((bytes / 1024).toFixed(2));
}

export function getCroppedBlobFromImage(
  img: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;
  canvas.width = Math.max(1, Math.floor(crop.width * scaleX));
  canvas.height = Math.max(1, Math.floor(crop.height * scaleY));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    img,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/jpeg");
  });
}

export function computedTitle(
  conversation: Conversation,
  userContact: Contact | null,
  otherUser: Participant | null
): string {
  return conversation.title !== ""
    ? conversation.title
    : userContact?.localName || otherUser?.email;
}

export const getWaveformWidth = (duration?: number) => {
  if (!duration) return "w-[180px]";

  if (duration < 10) return "w-[140px]";
  if (duration < 30) return "w-[200px]";
  if (duration < 60) return "w-[240px]";
  return "w-[280px]";
};
