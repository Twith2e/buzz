import { LucideArrowLeft, LucidePhone, LucideVideo } from "lucide-react";
import { formatLastSeen } from "@/lib/utils";
import { useConversationContext } from "@/contexts/ConversationContext";

interface ChatHeaderProps {
  onBack: () => void;
  onVideoCall: () => void;
  onAudioCall: () => void;
  onHeaderClick: () => void;
  isCallDisabled: boolean;
  isGroup: boolean;
  participantNames: string[];
  userOnlineStatus: boolean | undefined;
  userLastSeen: string | undefined;
  showBackButton: boolean;
  blockedMe?: boolean;
}

export function ChatHeader({
  onBack,
  onVideoCall,
  onAudioCall,
  onHeaderClick,
  isCallDisabled,
  isGroup,
  participantNames,
  userOnlineStatus,
  userLastSeen,
  showBackButton = true,
  blockedMe,
}: ChatHeaderProps) {
  const { conversationTitle } = useConversationContext();
  return (
    <div className="w-full">
      <header className="sticky top-0 w-full bg-background dark:bg-matteBlack text-foreground p-3 h-16 border-b flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button onClick={onBack} className="md:hidden text-foreground">
              <LucideArrowLeft size={24} />
            </button>
          )}
          <button
            onClick={onHeaderClick}
            className="flex flex-col gap-0.5 items-start hover:bg-muted/50 p-1 px-2 rounded-md transition-colors text-left"
          >
            <span className="font-medium">{conversationTitle}</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {isGroup && participantNames.length > 0 ? (
                participantNames.join(", ")
              ) : (
                <>
                  {!blockedMe && (
                    <>
                      {userOnlineStatus
                        ? "Online"
                        : userLastSeen
                          ? `Last seen ${formatLastSeen(userLastSeen)}`
                          : ""}
                    </>
                  )}
                </>
              )}
            </span>
          </button>
        </div>
        <div className="flex flex-row-reverse items-center gap-4 pr-4">
          <button
            className={`cursor-pointer hover:text-sky-300 ${blockedMe ? "opacity-50 cursor-not-allowed" : ""}`}
            type="button"
            onClick={!blockedMe ? onVideoCall : undefined}
            disabled={blockedMe}
          >
            <LucideVideo size={20} />
          </button>
          <button
            className={`cursor-pointer hover:text-sky-300 ${blockedMe || isCallDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            type="button"
            disabled={isCallDisabled || blockedMe}
            onClick={!blockedMe ? onAudioCall : undefined}
          >
            <LucidePhone size={18} />
          </button>
        </div>
      </header>
    </div>
  );
}
