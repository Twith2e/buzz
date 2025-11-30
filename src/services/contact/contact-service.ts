import api from "@/utils/api";
import { Contact, ContactListResponse } from "@/utils/types";

export async function getContactList(): Promise<Contact[]> {
  try {
    const response = await api.get<ContactListResponse>(
      "/users/get-contact-list"
    );
    return response.data.contacts;
  } catch (error) {
    throw error;
  }
}
