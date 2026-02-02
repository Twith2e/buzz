import { Conversation } from "./types";

export const isGroupChat = (conversation: Conversation) =>
  Boolean(conversation.title && conversation.title.trim() !== "");

export const hasLastMessage = (conversation: Conversation) =>
  Boolean(
    conversation.lastMessage &&
    Object.keys(conversation.lastMessage).length > 0,
  );

export const shouldRenderConversation = (conversation: Conversation) => {
  const group = isGroupChat(conversation);
  const lastMsg = hasLastMessage(conversation);

  return group || lastMsg;
};

export const getPreviewText = (conversation: Conversation, userId: string) => {
  if (hasLastMessage(conversation)) {
    return conversation.lastMessage;
  }

  return conversation.creator === userId
    ? "You created this group"
    : "You were added";
};

export const getTimestamp = (conversation: Conversation) =>
  hasLastMessage(conversation)
    ? conversation.lastMessage.ts
    : conversation.createdAt;
