import { useConversationContext } from "@/contexts/ConversationContext";
import api from "@/utils/api";
import { RefObject, useCallback, useEffect, useState } from "react";

const useChatPagination = ({
  conversationId,
  containerRef,
  hasMore,
  cursor,
}: {
  conversationId: string;
  containerRef: RefObject<HTMLDivElement>;
  hasMore: boolean;
  cursor: string | null;
}) => {
  const { setSentMessages, sentMessages, setCursor, setHasMore } =
    useConversationContext();
  const [loading, setLoading] = useState(false);

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    const previousScrollHeight = container.scrollHeight;

    const response = await api.get(
      `/messages/fetch/${conversationId}?before=${cursor}`
    );
    console.log(response);

    const olderMessages = response.data.messages;
    setSentMessages((prevMessages) => [
      ...olderMessages,
      ...(prevMessages || []),
    ]);
    console.log(sentMessages);

    setCursor(response.data.nextCursor);
    setHasMore(response.data.hasMore);

    setTimeout(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeight;
    }, 0);

    setLoading(false);
  }, [
    conversationId,
    cursor,
    hasMore,
    loading,
    containerRef,
    setSentMessages,
    setCursor,
    setHasMore,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop < 50) {
        loadOlderMessages();
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loadOlderMessages, containerRef]);

  return { loading };
};

export default useChatPagination;
