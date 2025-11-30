import { UserResponse } from "@/utils/types";
import api from "../../utils/api";

export async function getUser() {
  try {
    const response = await api.get<UserResponse>("/users/get-user");
    return response.data.user;
  } catch (e) {
    throw e;
  }
}
