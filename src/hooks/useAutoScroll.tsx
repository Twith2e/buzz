import { useEffect, RefObject } from "react";

interface UseAutoScrollProps {
  containerRef: RefObject<HTMLDivElement>;
  trigger: any;
}

export function useAutoScroll({ containerRef, trigger }: UseAutoScrollProps) {
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight || 0,
        behavior: "smooth",
      });
    }
  }, [trigger]);
}
