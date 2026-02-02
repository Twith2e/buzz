import { computedTitle, formatTime } from "@/lib/utils";

import LastMessage from "./LastMessage";
import { LucideUser2, LucideUsers } from "lucide-react";
import {
  getPreviewText,
  getTimestamp,
  hasLastMessage,
  isGroupChat,
  shouldRenderConversation,
} from "@/utils/conversation-selector";

import { Conversation, Contact, Participant, User } from "@/utils/types";
import { useUserContext } from "@/contexts/UserContext";

interface ConversationItemProps {
  conversation: Conversation;
  user: User | null;
  otherUser?: Participant;
  userContact?: Contact;
  unreadCount?: number;
  isActive?: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  user,
  otherUser,
  unreadCount = 0,
  isActive,
  onClick,
}: ConversationItemProps) {
  if (!shouldRenderConversation(conversation)) return null;

  const groupChat = isGroupChat(conversation);
  const preview = getPreviewText(conversation, user?._id || "");
  const timestamp = getTimestamp(conversation);

  const { contactList, fetchingContactList } = useUserContext();

  if (fetchingContactList) return null;

  const contact = contactList?.find(
    (contact) => contact?.contactProfile?._id === otherUser?._id,
  );

  console.log(contact);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`flex items-start w-full px-4 py-2 rounded-lg gap-3 justify-between
        ${isActive ? "bg-muted" : "hover:bg-muted/50"}
      `}
    >
      {/* Avatar */}
      <div className="h-14 w-14 rounded-full bg-sky-300 text-white border shadow-sm shrink-0 flex items-center justify-center">
        {!groupChat ? (
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

      {/* Middle */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="truncate text-foreground">
          {computedTitle(conversation, contact, otherUser)}
        </span>

        <span
          className={`text-xs truncate ${
            hasLastMessage(conversation)
              ? "text-foreground"
              : "italic text-muted-foreground"
          }`}
        >
          {hasLastMessage(conversation) ? (
            <LastMessage message={conversation.lastMessage!} />
          ) : (
            (preview as string)
          )}
        </span>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(timestamp)}
        </span>

        {unreadCount > 0 && (
          <span className="min-w-[18px] h-[18px] text-[11px] bg-sky-500 text-white rounded-full flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
