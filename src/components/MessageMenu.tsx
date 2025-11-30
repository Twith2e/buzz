import { useConversationContext } from "@/contexts/ConversationContext";
import { LucideForward } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const MessageMenu = ({
  message,
  setSelectedTag,
  setOpen,
}: {
  message: any;
  setSelectedTag: (tag: any) => void;
  setOpen: Dispatch<
    SetStateAction<{ open: boolean; top: number; left: number }>
  >;
}) => {
  const { setSelectedMessageId } = useConversationContext();
  return (
    <div className="p-2 rounded-sm">
      <button
        className="flex items-center gap-2 hover:bg-emerald-200"
        onClick={() => {
          const id = message._id || message.id;
          setSelectedMessageId(id);
          setSelectedTag({ id, message: message.message, from: message.from });
          setOpen((prev) => ({ ...prev, open: false }));
        }}
      >
        <LucideForward className="-rotate-180" size={14} /> Reply
      </button>
    </div>
  );
};

export default MessageMenu;
