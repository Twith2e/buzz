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
  isLoading: boolean;
  setConversations: Dispatch<SetStateAction<Conversation[] | null>>;
  selectedMessageId: string | null;
  setSelectedMessageId: Dispatch<SetStateAction<string | null>>;
  selectedImage: {
    images: Array<File> | null;
    currentIndex: number | null;
  };
  setSelectedImage: Dispatch<
    SetStateAction<{
      images: Array<File> | null;
      currentIndex: number | null;
    }>
  >;
  selectedDoc: {
    docs: Array<File> | null;
    currentIndex: number | null;
  };
  setSelectedDoc: Dispatch<
    SetStateAction<{
      docs: Array<File> | null;
      currentIndex: number | null;
    }>
  >;
  currentConversation: Conversation | null;
  setCurrentConversation: Dispatch<SetStateAction<Conversation | null>>;
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
  isLoading: false,
  setConversations: () => {},
  selectedMessageId: null,
  setSelectedMessageId: () => {},
  selectedImage: {
    images: null,
    currentIndex: 0,
  },
  setSelectedImage: () => {},
  selectedDoc: {
    docs: null,
    currentIndex: null,
  },
  setSelectedDoc: () => {},
  currentConversation: null,
  setCurrentConversation: () => {},
});

export default function ConversationContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    data: fetchedConversations,
    isLoading,
    refetch,
  } = useGetConversations();
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null
  );
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<{
    images: Array<File> | null;
    currentIndex: number | null;
  }>({
    images: null,
    currentIndex: null,
  });

  const [selectedDoc, setSelectedDoc] = useState<{
    docs: Array<File> | null;
    currentIndex: number | null;
  }>({
    docs: null,
    currentIndex: null,
  });

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
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);

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
        isLoading,
        setConversations,
        selectedMessageId,
        setSelectedMessageId,
        selectedImage,
        setSelectedImage,
        selectedDoc,
        setSelectedDoc,
        currentConversation,
        setCurrentConversation,
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
