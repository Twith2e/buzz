import { useConversationContext } from "@/contexts/ConversationContext";
import { useUserContext } from "@/contexts/UserContext";
import api from "@/utils/api";
import { Conversation, MessageResponse } from "@/utils/types";
import { computedTitle } from "@/lib/utils";
import { useNavigation } from "@/contexts/NavigationContext";
import ConversationItem from "./ConversationItem";

const Convo = ({
  conversation,
  isLoading,
}: {
  conversation?: Conversation;
  isLoading: boolean;
}) => {
  const { user, contactList, fetchingContactList } = useUserContext();
  const {
    currentConversation,
    enterConversation,
    setSentMessages,
    setConversationTitle,
    setCurrentConversation,
    setHasMore,
    setCursor,
    setIsFetchingMessage,
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
    (u) => u.contactProfile?._id === otherUser?._id,
  );

  async function fetchConvoMessages(convoId: string) {
    setIsFetchingMessage(true);
    try {
      const response = await api.get<MessageResponse>(
        `/messages/fetch/${convoId}`,
      );
      setHasMore(response.data.hasMore);
      setCursor(response.data.nextCursor);
      setSentMessages(response.data.messages);
    } catch (error) {
      console.error(error);
      setSentMessages([]);
    } finally {
      setIsFetchingMessage(false);
    }
  }

  const handleConversationClick = () => {
    const title = computedTitle(conversation, userContact, otherUser);
    push("chat");
    enterConversation(conversation._id);
    fetchConvoMessages(conversation._id);
    setCurrentConversation(conversation);
    setSentMessages([]);
    setConversationTitle(title);
  };

  return (
    <ConversationItem
      conversation={conversation}
      user={user}
      otherUser={otherUser}
      userContact={userContact}
      isActive={currentConversation?._id === conversation._id}
      onClick={handleConversationClick}
    />
  );
};

export default Convo;
