import { useTypingContext } from "@/contexts/TypingContext";
import { useUserContext } from "@/contexts/UserContext";

export default function TypingIndicator() {
  const { typingUsers } = useTypingContext();
  const { contactList } = useUserContext();

  if (typingUsers.size === 0) {
    return null;
  }

  const typingUserIds = Array.from(typingUsers.keys());
  const typingNames = typingUserIds
    .map((id) => {
      const contact = contactList.find((c) => c.contactProfile?._id === id);
      return contact?.localName || id;
    })
    .join(", ");

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
