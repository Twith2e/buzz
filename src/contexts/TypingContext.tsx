import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
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
  const clearTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const handleTypingReceived = useCallback(
    (receivedUserId: string, typing: boolean) => {
      // Clear any existing timer for this user
      const existingTimer = clearTimers.current.get(receivedUserId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        clearTimers.current.delete(receivedUserId);
      }

      if (typing) {
        // User is typing - add them to the map
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.set(receivedUserId, true);
          console.log(
            "[TypingContext] Updated typingUsers:",
            Array.from(updated.keys())
          );
          return updated;
        });
      } else {
        // User stopped typing - remove immediately
        setTypingUsers((prev) => {
          const updated = new Map(prev);
          updated.delete(receivedUserId);
          console.log(
            "[TypingContext] Removed typing user:",
            receivedUserId,
            "Remaining:",
            Array.from(updated.keys())
          );
          return updated;
        });
      }
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
    setIsUserTyping(typing);
  }, []);

  const setConversationIdWrapper = useCallback((id: string) => {
    setConversationId(id);
  }, []);

  return (
    <TypingContext.Provider
      value={{
        typingUsers,
        setUserTyping,
        setConversationId: setConversationIdWrapper,
      }}>
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
