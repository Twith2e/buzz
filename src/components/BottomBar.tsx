import { buttonInfos } from "@/data/ButtonInfos";
import { useNavigation } from "@/contexts/NavigationContext";

export default function BottomBar() {
  const { push, current } = useNavigation();

  function handleClick(text: string) {
    const t = text.toLowerCase();
    if (t === "story") push("status");
    else if (t === "conversations") push("conversations");
    else if (t === "settings") push("settings");
    else if (t === "calls") {
      // Logic for calls if needed, or just placeholder
      console.log("Calls clicked");
    }
  }

  return (
    <div className="flex items-center justify-around bg-background border-t border-sky-300 h-16 w-full fixed bottom-0 left-0 z-50 pb-safe">
      {buttonInfos.map((btn) => {
        const Icon = btn.icon;
        const isActive =
          (btn.text.toLowerCase() === "conversations" &&
            current.name === "conversations") ||
          (btn.text.toLowerCase() === "story" && current.name === "status") ||
          (btn.text.toLowerCase() === "settings" &&
            current.name === "settings");

        return (
          <button
            key={btn.id}
            onClick={() => handleClick(btn.text)}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive ? "text-primary" : "text-gray-500"
            }`}
          >
            <Icon size={24} />
            <span className="text-[10px] mt-1">{btn.text}</span>
          </button>
        );
      })}
    </div>
  );
}
