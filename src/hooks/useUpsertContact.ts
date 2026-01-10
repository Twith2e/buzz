import { useMutation, useQueryClient } from "react-query";
import api from "@/utils/api";
import { Contact } from "@/utils/types";
import { useConversationContext } from "@/contexts/ConversationContext";

type UpsertPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
};

// API call for adding/updating a contact
async function upsertContactApi(payload: UpsertPayload): Promise<Contact> {
  const res = await api.post<{ contact: Contact }>("/users/add-contact", {
    friendEmail: payload.email,
    localName: `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim(),
  });

  if (res.status !== 200) {
    throw new Error("Failed to upsert contact");
  }

  return res.data.contact;
}

export function useUpsertContact() {
  const { conversationTitle, setConversationTitle } = useConversationContext();

  const queryClient = useQueryClient();

  return useMutation(upsertContactApi, {
    // Optimistic update before the request completes
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["contact"] });

      const previousContacts = queryClient.getQueryData<Contact[]>(["contact"]);

      if (
        conversationTitle &&
        conversationTitle.toLowerCase() === payload.email.toLowerCase() &&
        payload.firstName
      ) {
        setConversationTitle(payload.firstName);
      }
      queryClient.setQueryData<Contact[]>(["contact"], (old) => {
        if (!old) return old;

        const existing = old.find((c) => c.email === payload.email);
        if (existing) {
          // Update localName optimistically
          return old.map((c) =>
            c.email === payload.email
              ? { ...c, localName: payload.firstName ?? c.localName }
              : c
          );
        }
        // If not found, leave old list as is; server will provide new contact
        return old;
      });

      return { previousContacts };
    },

    // Rollback on error
    onError: (_err, _payload, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(["contact"], context.previousContacts);
      }
    },

    // Update cache with server response
    onSuccess: (serverContact) => {
      queryClient.setQueryData<Contact[]>(["contact"], (old) => {
        if (!old) return [serverContact];
        const found = old.find((c) => c.email === serverContact.email);
        if (found) {
          return old.map((c) =>
            c.email === serverContact.email ? serverContact : c
          );
        } else {
          return [...old, serverContact];
        }
      });
    },

    // Optional: refetch to ensure full server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contact"] });
    },
  });
}
