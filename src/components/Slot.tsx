import { SlotProps } from "input-otp";
import { cn } from "../utils/cn";
import FakeCaret from "./FakeCarets";

export default function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative w-12 h-14 text-2xl",
        "flex items-center justify-center",
        "transition-all duration-200",
        "bg-gray-100 border border-gray-300 rounded-lg text-black",
        "shadow-sm",
        "focus-within:ring-2 focus-within:ring-blue-400",
        "group-hover:border-gray-400",
        { "ring-2 ring-blue-400": props.isActive }
      )}
    >
      <div className="select-none text-center">
        {props.char ?? props.placeholderChar}
      </div>
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}
