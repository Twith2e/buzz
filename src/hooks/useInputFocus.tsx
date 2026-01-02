import { useEffect, RefObject } from "react";

interface UseInputFocusProps {
  inputRef: RefObject<HTMLInputElement>;
  shouldFocus: boolean;
  triggerAfterSend: number;
}

export function useInputFocus({
  inputRef,
  shouldFocus,
  triggerAfterSend,
}: UseInputFocusProps) {
  // Auto-focus on room change
  useEffect(() => {
    if (!shouldFocus) return;

    const isSmallScreen =
      typeof window !== "undefined" && window.innerWidth < 768;
    const isMobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod|Windows Phone/.test(navigator.userAgent);

    if (isSmallScreen || isMobile) return;

    const id = window.requestAnimationFrame(() => {
      if (inputRef.current) {
        try {
          inputRef.current.focus();
          const len = inputRef.current.value?.length || 0;
          inputRef.current.setSelectionRange(len, len);
        } catch (err) {
          // ignore errors on mobile browsers that block focus
        }
      }
    });

    return () => cancelAnimationFrame(id);
  }, [shouldFocus, inputRef]);

  // Focus after message is sent
  useEffect(() => {
    if (!inputRef.current) return;

    const isSmallScreen =
      typeof window !== "undefined" && window.innerWidth < 768;
    const isMobile =
      typeof navigator !== "undefined" &&
      /Mobi|Android|iPhone|iPad|iPod|Windows Phone/.test(navigator.userAgent);

    if (isSmallScreen || isMobile) return;

    const id = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(id);
  }, [triggerAfterSend, inputRef]);
}
