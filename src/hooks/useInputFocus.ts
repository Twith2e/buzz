import { useEffect, RefObject } from "react";

interface UseInputFocusProps {
  inputRef: RefObject<HTMLInputElement>;
  shouldFocus: boolean;
  triggerAfterSend: number;
  selectedTag: {
    id: string;
    message: string;
    from: any;
  } | null;
}

function canAutoFocus() {
  if (typeof window === "undefined") return false;

  // Explicitly block mobile devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  if (isMobile) return false;

  // Also block on small screens (e.g. resized desktop)
  if (window.innerWidth < 768) return false;

  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches
  );
}

export function useInputFocus({
  inputRef,
  shouldFocus,
  triggerAfterSend,
  selectedTag,
}: UseInputFocusProps) {
  // Focus on room / reply change
  useEffect(() => {
    if (!shouldFocus) return;
    if (!canAutoFocus()) return;

    const id = requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;

      try {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      } catch {
        // silently fail (Safari / iOS)
      }
    });

    return () => cancelAnimationFrame(id);
  }, [shouldFocus, selectedTag, inputRef]);

  // Focus after sending message
  useEffect(() => {
    if (!canAutoFocus()) return;

    const el = inputRef.current;
    if (!el) return;

    const id = setTimeout(() => {
      try {
        el.focus();
      } catch {}
    }, 50);

    return () => clearTimeout(id);
  }, [triggerAfterSend, selectedTag, inputRef]);
}
