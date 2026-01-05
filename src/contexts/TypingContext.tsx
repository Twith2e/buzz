import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import useUserTyping from "@/hooks/useUserTyping";

interface TypingContextType {
  typingUsers: Map<string, boolean>; // userId -> isTyping
  setUserTyping: (typing: boolean) => void;
  setConversationId: (id: string) => void;
}

const TypingContext = createContext<TypingContextType | undefined>(undefined);

export const TypingProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [conversationId, setConversationId] = useState("");
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(
    new Map()
  );
  const [isUserTyping, setIsUserTyping] = useState(false);

  const handleTypingReceived = useCallback(
    (receivedUserId: string, typing: boolean) => {
      console.log("[TypingContext] Received typing event:", {
        receivedUserId,
        typing,
      });
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        if (typing) {
          updated.set(receivedUserId, true);
        } else {
          updated.delete(receivedUserId);
        }
        console.log(
          "[TypingContext] Updated typingUsers:",
          Array.from(updated.keys())
        );
        return updated;
      });
    },
    []
  );

  // Use the hook to manage socket events
  useUserTyping({
    conversationId,
    userId,
    typing: isUserTyping,
    onTypingReceived: handleTypingReceived,
  });

  const setUserTyping = useCallback((typing: boolean) => {
    console.log("[TypingContext] setUserTyping:", typing);
    setIsUserTyping(typing);
  }, []);

  const setConversationIdWrapper = useCallback((id: string) => {
    console.log("[TypingContext] setConversationId:", id);
    setConversationId(id);
  }, []);

  return (
    <TypingContext.Provider
      value={{
        typingUsers,
        setUserTyping,
        setConversationId: setConversationIdWrapper,
      }}
    >
      {children}
    </TypingContext.Provider>
  );
};

export const useTypingContext = () => {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error("useTypingContext must be used within TypingProvider");
  }
  return context;
};
