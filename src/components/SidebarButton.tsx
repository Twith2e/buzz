import { IconType } from "react-icons/lib";
import { useNavigation } from "@/contexts/NavigationContext";

export default function SidebarButton({
  icon: Icon,
  text,
  color,
  expanded,
  id,
}: {
  icon: IconType;
  text: string;
  color: string;
  expanded: boolean;
  id: number;
}) {
  const { push, current } = useNavigation();

  function handleClick() {
    if (text.toLowerCase() === "story") push("status");
    else if (text.toLowerCase() === "conversations") push("chat");
    else if (text.toLowerCase() === "settings") push("settings");
  }

  const isActive =
    (text.toLowerCase() === "conversations" && current.name === "chat") ||
    (text.toLowerCase() === "story" && current.name === "status") ||
    (text.toLowerCase() === "settings" && current.name === "settings");

  return (
    <button
      onClick={handleClick}
      key={id}
      className={`${
        isActive ? "bg-foreground text-background" : ""
      } flex items-center hover:bg-foreground hover:text-background cursor-pointer w-full px-3 py-[.7rem] transition-[color] duration-100`}
      title={text}>
      <span className={`shrink-0`}>
        <Icon size={24} />
      </span>

      <div
        className={`overflow-hidden transition-[width,opacity] duration-300 ${
          expanded ? "opacity-100 w-auto ml-3" : "opacity-0 w-0"
        }`}>
        <span className={`font-sans text-xs text-nowrap`}>{text}</span>
      </div>
    </button>
  );
}
