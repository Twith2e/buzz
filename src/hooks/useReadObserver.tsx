import { useEffect, useRef } from "react";

const useReadObserver = ({
  emit,
  roomId,
  userId,
}: {
  emit: (event: string, payload: any, ack?: (a: any) => void) => void;
  roomId: string;
  userId: string;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageRefs = useRef<Map<string, HTMLElement>>(new Map());
  const lastUpToIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleIncoming: { id: string; ts: string }[] = [];

        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          const id = el.dataset.id || "";
          const from = el.dataset.from || "";
          const ts = el.dataset.ts || "";
          const isIncoming = from !== userId;
          if (!id || !isIncoming) return;
          if (e.isIntersecting) visibleIncoming.push({ id, ts });
        });

        if (!visibleIncoming.length) return;
        visibleIncoming.sort((a, b) => a.ts.localeCompare(b.ts));
        const upTo = visibleIncoming[visibleIncoming.length - 1];

        if (upTo.id !== lastUpToIdRef.current) {
          emit(
            "messages:readUpTo",
            { conversationId: roomId, upToId: upTo.id },
            (ack: any) => {
              if (ack?.status === "ok") lastUpToIdRef.current = upTo.id;
            }
          );
        }
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    messageRefs.current.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [emit, roomId, userId]);

  const registerMessageRef = (id: string) => (el: HTMLElement | null) => {
    const obs = observerRef.current;
    const prev = messageRefs.current.get(id);
    if (prev && obs) obs.unobserve(prev);

    if (el) {
      messageRefs.current.set(id, el);
      if (obs) obs.observe(el);
    } else {
      messageRefs.current.delete(id);
    }
  };

  return { containerRef, registerMessageRef };
};

export default useReadObserver;
