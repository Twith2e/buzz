import axios from "axios";
import api from "./api";
import { CloudinaryUploadResponse } from "./types";

export async function getCloudinarySignature(folder: string) {
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
  signData: Record<string, string | number>
): Promise<CloudinaryUploadResponse> {
  const resourceType = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
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

  console.log("signature: ", signData.signature);

  if (signData.folder) {
    formData.append("folder", signData.folder.toString());

    console.log("folder: ", signData.folder);
  }

  try {
    const response = await axios.post(url, formData);
    return response.data;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    throw error;
  }
}
