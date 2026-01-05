import { LucideArrowLeft, LucidePhone, LucideVideo } from "lucide-react";
import ConversationTitle from "./ConversationTitle";
import { formatTime } from "@/lib/utils";
import TypingIndicator from "./TypingIndicator";

interface ChatHeaderProps {
  conversationTitle: string;
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
  conversationTitle,
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
  return (
    <header className="bg-background dark:bg-matteBlack text-foreground w-full p-3 h-16 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button onClick={onBack} className="md:hidden text-foreground">
            <LucideArrowLeft size={24} />
          </button>
        )}
        <div className="flex flex-col gap-2">
          <span>
            <ConversationTitle title={conversationTitle} />
          </span>
          <span className="text-xs">
            {isGroup && participantNames.length > 0 ? (
              participantNames.join(", ")
            ) : (
              <>
                {userOnlineStatus
                  ? "Online"
                  : `Last seen ${formatTime(userLastSeen || "")}`}
              </>
            )}
          </span>
          <TypingIndicator />
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
