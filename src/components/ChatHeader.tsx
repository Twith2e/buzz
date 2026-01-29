import { LucideArrowLeft, LucidePhone, LucideVideo } from "lucide-react";
import { formatLastSeen } from "@/lib/utils";
import { useConversationContext } from "@/contexts/ConversationContext";

interface ChatHeaderProps {
  onBack: () => void;
  onVideoCall: () => void;
  onAudioCall: () => void;
  isCallDisabled: boolean;
  isGroup: boolean;
  participantNames: string[];
  userOnlineStatus: boolean | undefined;
  userLastSeen: string | undefined;
  showBackButton: boolean;
}

export function ChatHeader({
  onBack,
  onVideoCall,
  onAudioCall,
  isCallDisabled,
  isGroup,
  participantNames,
  userOnlineStatus,
  userLastSeen,
  showBackButton = true,
}: ChatHeaderProps) {
  const { conversationTitle } = useConversationContext();
  return (
    <header className="sticky top-0 left-0 right-0 bg-background dark:bg-matteBlack text-foreground p-3 h-16 border-b flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button onClick={onBack} className="md:hidden text-foreground">
            <LucideArrowLeft size={24} />
          </button>
        )}
        <div className="flex flex-col gap-2">
          <span>{conversationTitle}</span>
          <span className="text-xs">
            {isGroup && participantNames.length > 0 ? (
              participantNames.join(", ")
            ) : (
              <>
                {userOnlineStatus
                  ? "Online"
                  : userLastSeen
                    ? `Last seen ${formatLastSeen(userLastSeen)}`
                    : ""}
              </>
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-row-reverse items-center gap-4 pr-4">
        <button
          className="cursor-pointer hover:text-sky-300"
          type="button"
          onClick={onVideoCall}
        >
          <LucideVideo size={20} />
        </button>
        <button
          className="cursor-pointer hover:text-sky-300"
          type="button"
          disabled={isCallDisabled}
          onClick={onAudioCall}
        >
          <LucidePhone size={18} />
        </button>
      </div>
    </header>
  );
}
