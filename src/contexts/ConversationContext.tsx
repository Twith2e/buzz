import { useUserContext } from "@/contexts/UserContext";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { useQueryClient } from "react-query";
import { ChatMessage, Conversation } from "@/utils/types";
import { useGetConversations } from "@/services/conversation/conversation";

type ConversationContextType = {
  roomId: string;
  setRoomId: (roomId: string) => void;
  email: string | null;
  createConversation: (email: string, id: string) => void;
  enterConversation: (roomId: string) => void;
  contact: string | null;
  initialized: boolean;
  sentMessages: ChatMessage[];
  setSentMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  usersOnline: Array<{
    _id: string;
    online: boolean;
    lastSeen?: string;
  }>;
  setUsersOnline: Dispatch<
    SetStateAction<Array<{ _id: string; online: boolean; lastSeen?: string }>>
  >;
  conversationTitle: string;
  setConversationTitle: (title: string) => void;
  conversations: Conversation[] | null;
  setConversations: Dispatch<SetStateAction<Conversation[] | null>>;
  selectedMessageId: string | null;
  setSelectedMessageId: Dispatch<SetStateAction<string | null>>;
};

const ConversationContext = createContext<ConversationContextType>({
  roomId: "",
  setRoomId: () => {},
  email: null,
  createConversation: () => {},
  enterConversation: () => {},
  contact: null,
  initialized: false,
  sentMessages: [],
  setSentMessages: () => {},
  usersOnline: [],
  setUsersOnline: () => {},
  conversationTitle: "",
  setConversationTitle: () => {},
  conversations: null,
  setConversations: () => {},
  selectedMessageId: null,
  setSelectedMessageId: () => {},
});

export default function ConversationContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: fetchedConversations, refetch } = useGetConversations();
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (fetchedConversations) {
      setConversations(fetchedConversations);
    }
  }, [fetchedConversations]);
  const { emit, on } = useSocketContext();
  const { user } = useUserContext();
  const queryClient = useQueryClient();
  const [roomId, setRoomId] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [sentMessages, setSentMessages] = useState<ChatMessage[]>([]);
  const [usersOnline, setUsersOnline] = useState<
    Array<{ _id: string; online: boolean; lastSeen?: string }>
  >([]);
  const [conversationTitle, setConversationTitle] = useState("");

  function createConversation(email: string, id: string) {
    const ids = [user._id, id].sort();
    const localRoomId = `direct:${ids[0]}:${ids[1]}`;
    setEmail(email);
    setContact(id);
    setRoomId(localRoomId);
    setInitialized(true);
    emit(
      "initiate-chat",
      { userId: user._id, contactId: id, room: localRoomId },
      (ack: any) => {
        if (ack && ack.status === "success") {
          const cid = ack.conversationId ?? localRoomId;
          setRoomId(cid);
          queryClient.setQueryData(["conversations"], (prev: any) => {
            const list = Array.isArray(prev) ? prev : [];
            const exists = list.some(
              (c: any) => c._id === cid || c.roomId === localRoomId
            );
            if (exists) return list;
            const now = new Date().toISOString();
            const newConvo = {
              _id: cid,
              roomId: localRoomId,
              creator: user._id,
              __v: 0,
              createdAt: now,
              lastMessageAt: "",
              participants: [
                {
                  _id: user._id,
                  displayName: user.displayName,
                  email: user.email,
                  profilePic: user.profilePic,
                },
                {
                  _id: id,
                  displayName: "",
                  email: email || "",
                  profilePic: null,
                },
              ],
              title: email || "",
              updatedAt: now,
              lastMessage: {
                _id: "",
                conversation: cid,
                from: user._id,
                message: "",
                ts: now,
                attachments: [],
                status: "sent",
                createdAt: now,
                updatedAt: now,
                __v: 0,
              },
            };
            return [newConvo, ...list];
          });
        }
      }
    );
  }

  function enterConversation(roomId: string) {
    setRoomId(roomId);
    setInitialized(true);
    emit("join:conversation", { roomId });
  }

  useEffect(() => {
    if (!on) return;
    const off = on("chat-initialized", ({ roomId }) => {
      setRoomId(roomId);
      setInitialized(true);
    });
    return off;
  }, [on]);

  return (
    <ConversationContext.Provider
      value={{
        roomId,
        setRoomId,
        email,
        createConversation,
        enterConversation,
        contact,
        initialized,
        sentMessages,
        setSentMessages,
        usersOnline,
        setUsersOnline,
        conversationTitle,
        setConversationTitle,
        conversations,
        setConversations,
        selectedMessageId,
        setSelectedMessageId,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const ctx = useContext(ConversationContext);
  if (!ctx) {
    throw new Error(
      "useConversationContext must be used within a ConversationContextProvider"
    );
  }
  return ctx;
}
