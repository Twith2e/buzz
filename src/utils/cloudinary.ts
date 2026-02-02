import api from "./api";
import axios from "axios";
import { CloudinaryUploadResponse } from "./types";

export async function getCloudinarySignature(folder?: string) {
  try {
    const response = await api.post("/upload/sign", { folder });
    return response.data;
  } catch (error) {
    console.error("Error getting Cloudinary signature:", error);
    throw error;
  }
}

export async function uploadFileToCloudinary(
  file: File,
  signData: Record<string, string | number>,
): Promise<CloudinaryUploadResponse> {
  const mime = file.type || "";
  const ext =
    (file.name || "").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || "";
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
  const url = `https://api.cloudinary.com/v1_1/${
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  }/${resourceType}/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.api_key.toString());
  formData.append("timestamp", signData.timestamp.toString());
  if (signData.eager) formData.append("eager", signData.eager.toString());
  formData.append("signature", signData.signature.toString());
  // Force public delivery; avoid authenticated/private which requires signed delivery URLs
  formData.append("type", "upload");
  formData.append("access_mode", "public");

  if (signData.folder) {
    formData.append("folder", signData.folder.toString());
  }

  try {
    const response = await axios.post(url, formData);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error uploading file to Cloudinary:",
      error?.response?.data || error,
    );
    throw error;
  }
}
