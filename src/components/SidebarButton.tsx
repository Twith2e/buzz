import { IconType } from "react-icons/lib";

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
  return (
    <button
      key={id}
      className="flex items-center hover:bg-gray-400 w-full px-3 py-[.7rem] transition-all duration-300"
      title={text}
    >
      <span className="shrink-0">
        <Icon color={color} size={24} />
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
