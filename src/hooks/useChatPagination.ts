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
  // track if we're programmatically changing scroll to avoid re-triggering
  const programmaticRef = { current: false } as { current: boolean };
  let debounceTimer: any = null;

  const loadOlderMessages = useCallback(async () => {
    if (!hasMore || !cursor || loading) return;
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    const previousScrollHeight = container.scrollHeight;

    const response = await api.get(
      `/messages/fetch/${conversationId}?before=${cursor}`
    );

    const olderMessages = response.data.messages;
    setSentMessages((prevMessages) => [
      ...olderMessages,
      ...(prevMessages || []),
    ]);

    setCursor(response.data.nextCursor);
    setHasMore(response.data.hasMore);

    // prevent the scroll handler from firing while we adjust scrollTop
    programmaticRef.current = true;
    setTimeout(() => {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - previousScrollHeight;

      // allow small delay before re-enabling scroll-triggering
      setTimeout(() => {
        programmaticRef.current = false;
      }, 50);
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
      if (programmaticRef.current) return;

      // debounce scroll events to only trigger when user stops scrolling
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // only trigger when truly at the top (user scrolled to top)
        if (container.scrollTop <= 0) {
          loadOlderMessages();
        }
      }, 120);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [loadOlderMessages, containerRef]);

  return { loading };
};

export default useChatPagination;
