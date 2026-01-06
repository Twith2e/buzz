import { useTypingContext } from "@/contexts/TypingContext";
import { useUserContext } from "@/contexts/UserContext";
import { useConversationContext } from "@/contexts/ConversationContext";

export default function TypingIndicator() {
  const { typingUsers } = useTypingContext();
  const { contactList } = useUserContext();
  const { currentConversation } = useConversationContext();

  console.log("[TypingIndicator] typingUsers size:", typingUsers.size);

  if (typingUsers.size === 0) {
    return null;
  }

  // Check if it's a group chat (more than 2 participants)
  const isGroupChat = currentConversation?.participants?.length > 2;

  const typingUserIds = Array.from(typingUsers.keys());
  const typingNames = typingUserIds
    .map((id) => {
      const contact = contactList?.find((c) => c.contactProfile?._id === id);
      const participant = currentConversation?.participants?.find(
        (p) => p._id === id
      );

      // In group chats, show contact name; in direct chats, skip name entirely
      if (isGroupChat) {
        return (
          contact?.localName ||
          participant?.displayName ||
          participant?.email ||
          id
        );
      }
      return null;
    })
    .filter(Boolean)
    .join(", ");

  if (!typingNames && !isGroupChat) {
    // For direct chats with no name to show, just show the indicator
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <span>typing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
      <span>{typingNames} is typing...</span>
    </div>
  );
}
