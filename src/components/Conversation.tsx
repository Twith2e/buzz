import { useConversationContext } from "@/contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/utils/api";
import { Conversation, MessageResponse } from "@/utils/types";
import { formatTime } from "@/lib/utils";
import { LucideFile, LucideUser2 } from "lucide-react";

const Convo = ({ conversation }: { conversation: Conversation }) => {
  const { user } = useUserContext();
  const { enterConversation, setSentMessages, setConversationTitle } =
    useConversationContext();
  const { contactList } = useUserContext();
  const otherUser = conversation.participants.find((u) => u._id !== user._id);
  const userContact = contactList.find(
    (u) => u.contactProfile._id === otherUser?._id
  );

  const computedTitle =
    conversation.title !== ""
      ? conversation.title
      : userContact?.localName || otherUser?.email;

  async function fetchConvoMessages(convoId: string) {
    try {
      const response = await api.get<MessageResponse>(
        `/messages/fetch/${convoId}`
      );
      setSentMessages(response.data.messages);
    } catch (error) {
      console.error(error);
    }
  }

  // helper to safely return last attachment filename
  function getLastAttachmentFileName(lastMessage: any) {
    const at = lastMessage?.attachments;
    if (!at || !Array.isArray(at) || at.length === 0) return null;
    return <span className="flex items-center gap-2"><LucideFile size={14} /> {at[at.length - 1]?.fileName}</span>
  }

  const lastAttachmentFileName = getLastAttachmentFileName(
    conversation.lastMessage
  );

  return (
    <div
      key={conversation._id}
      role="button"
      tabIndex={0}
      onClick={() => {
        setConversationTitle(computedTitle);
        enterConversation(conversation._id);
        fetchConvoMessages(conversation._id);
      }}
      className="flex items-start w-full px-4 py-2 rounded-lg"
    >
      <div className="flex gap-3 w-[95%]">
        <div className="h-10 w-10 rounded-full bg-brandSky border p-1 shrink-0">
          <LucideUser2 className="h-full w-full" />
        </div>
        <div className="flex flex-col items-start w-full">
          <span className="max-w-[80%] truncate">
            {computedTitle}
          </span>
          <span className="text-xs text-[#AAA] truncate max-w-[90%]">
            {conversation.lastMessage
              ? lastAttachmentFileName ?? conversation.lastMessage.message
              : conversation.creator === user._id
                ? "You created this group"
                : "You were added"}
          </span>
        </div>
      </div>
      <span className="text-xs whitespace-nowrap flex-1">
        {formatTime(
          conversation.lastMessage
            ? conversation.lastMessage.ts
            : conversation.title && conversation.createdAt
        )}
      </span>
    </div>
  );
};

export default Convo;
