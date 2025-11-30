import api from "@/utils/api";
import { ConversationResponse } from "@/utils/types";

export async function getConversations() {
  try {
    const response = await api.get<ConversationResponse>("/messages/fetch");
    return response.data.conversations;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
