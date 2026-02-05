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

export async function updateUser(data: {
  displayName?: string;
  profilePic?: string;
}) {
  try {
    const response = await api.put<UserResponse>("/users/update-profile", data);
    return response.data.user;
  } catch (e) {
    throw e;
  }
}

export async function blockContact(email: string, block: boolean) {
  try {
    const response = await api.post(
      `/users/block-contact?contactEmail=${email}&block=${block}`,
    );
    return response.data;
  } catch (e) {
    throw e;
  }
}
