import api from "@/utils/api";
import { SettingsResponse } from "@/utils/types";

export async function getSettings(): Promise<SettingsResponse> {
  try {
    const response = await api.get("/settings");
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
}
