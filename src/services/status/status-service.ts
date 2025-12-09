import api from "@/utils/api";
import { StatusResponse } from "@/utils/types";

export async function getStatuses(): Promise<StatusResponse> {
  try {
    const response = await api.get("/upload/statuses");
    return response.data;
  } catch (error) {
    throw error;
  }
}
