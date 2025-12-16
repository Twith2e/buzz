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
  const { push } = useNavigation();

  function handleClick() {
    if (text.toLowerCase() === "story") push("status");
    else if (text.toLowerCase() === "conversations") push("chat");
    else if (text.toLowerCase() === "settings") push("settings");
  }

  return (
    <button
      onClick={handleClick}
      key={id}
      className="flex items-center hover:bg-gray-400 w-full px-3 py-[.7rem] transition-all duration-300"
      title={text}
    >
      <span className={`shrink-0 text-${color}`}>
        <Icon size={24} />
      </span>

      <div
        className={`overflow-hidden transition-[width,opacity] duration-300 ${
          expanded ? "opacity-100 w-auto ml-3" : "opacity-0 w-0"
        }`}
      >
        <span className={`text-${color} font-sans text-xs text-nowrap`}>
          {text}
        </span>
      </div>
    </button>
  );
}
