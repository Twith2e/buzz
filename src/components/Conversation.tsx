import { useConversationContext } from "@/contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/utils/api";
import { Conversation, MessageResponse } from "@/utils/types";
import { computedTitle, formatTime } from "@/lib/utils";
import { LucideUser2, LucideUsers } from "lucide-react";
import LastMessage from "./LastMessage";
import { useNavigation } from "@/contexts/NavigationContext";

const Convo = ({
  conversation,
  isLoading,
}: {
  conversation?: Conversation;
  isLoading: boolean;
}) => {
  const { user, contactList, fetchingContactList } = useUserContext();
  const {
    enterConversation,
    setSentMessages,
    setConversationTitle,
    setCurrentConversation,
    setHasMore,
    setCursor,
  } = useConversationContext();
  const { push } = useNavigation();

  if (isLoading) {
    return (
      <div className="flex items-center w-full px-4 py-2 gap-3 animate-pulse">
        <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex flex-col gap-2 w-full overflow-hidden">
          <div className="flex justify-between items-center w-full">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/3 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 w-10 rounded" />
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 w-3/4 rounded" />
        </div>
      </div>
    );
  }

  if (!conversation) return null;

  const otherUser = conversation.participants.find((u) => u._id !== user?._id);
  if (fetchingContactList) return null;
  const userContact = contactList?.find(
    (u) => u.contactProfile?._id === otherUser?._id
  );

  async function fetchConvoMessages(convoId: string) {
    try {
      const response = await api.get<MessageResponse>(
        `/messages/fetch/${convoId}`
      );
      setHasMore(response.data.hasMore);
      setCursor(response.data.nextCursor);
      setSentMessages(response.data.messages);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      key={conversation._id}
      data-contact-id={otherUser?._id}
      role="button"
      tabIndex={0}
      onClick={() => {
        push("chat");
        setConversationTitle(
          otherUser
            ? computedTitle(conversation, userContact, otherUser)
            : otherUser?.email
        );
        enterConversation(conversation._id);
        fetchConvoMessages(conversation._id);
        setCurrentConversation(conversation);
        setSentMessages([]);
      }}
      className="flex items-start w-full px-4 py-2 rounded-lg gap-3 justify-between"
    >
      <div className="h-14 w-14 rounded-full bg-sky-300 text-white border shadow-sm shrink-0 flex items-center justify-center">
        {conversation.participants.length === 2 ? (
          otherUser?.profilePic ? (
            <img
              src={otherUser.profilePic}
              alt="profile"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <LucideUser2 size={20} />
          )
        ) : (
          <LucideUsers size={20} />
        )}
      </div>
      <div className="flex flex-col gap-1 items-start min-w-0 flex-1">
        <span className="truncate text-foreground w-full text-left">
          {otherUser
            ? computedTitle(conversation, userContact, otherUser)
            : otherUser?.email}
        </span>
        <span className="text-xs truncate text-foreground w-full text-left">
          {conversation.lastMessage ? (
            conversation.lastMessage.attachments &&
            conversation.lastMessage.attachments.length > 0 ? (
              <LastMessage message={conversation.lastMessage} />
            ) : (
              conversation.lastMessage.message
            )
          ) : conversation.creator === user._id ? (
            "You created this group"
          ) : (
            "You were added"
          )}
        </span>
      </div>
      <span className="text-xs whitespace-nowrap shrink-0 text-foreground">
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
