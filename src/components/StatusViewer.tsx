import { formatRelativeTime } from "@/lib/utils";
import { useUserContext } from "@/contexts/UserContext";
import { Status, ChatMessage } from "@/utils/types";
import { LucideX } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import { useSocketContext } from "@/contexts/SocketContext";
import { useGetConversations } from "@/services/conversation/conversation";
import { useConversationContext } from "@/contexts/ConversationContext";

interface StatusViewerProps {
  status: Array<Status>;
  onClose: () => void;
}

const STATUS_DURATION = 5000;

const StatusViewer = ({ status: statuses, onClose }: StatusViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reply, setReply] = useState("");
  const [isPaused, setIsPaused] = useState(false);

  const { contactList, user } = useUserContext();
  const { emit } = useSocketContext();
  const { data: conversations } = useGetConversations();

  const {
    setSentMessages,
    setConversations,
    roomId: activeRoomId,
  } = useConversationContext();

  const currentStatus = statuses[currentIndex];
  // Calculate relative time for the current status
  const relativeTime = currentStatus
    ? formatRelativeTime(currentStatus.createdAt)
    : "";

  const viewingContact = contactList.find(
    (contact) => contact.contactProfile._id === currentStatus?.userId
  );

  const displayName = viewingContact
    ? viewingContact.localName
    : user?.displayName || "My Status";
  const profilePic =
    viewingContact?.contactProfile?.profilePic ||
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${displayName}&background=random`;

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  useEffect(() => {
    if (!currentStatus) return;

    let progressInterval: ReturnType<typeof setInterval>;

    if (currentStatus.resourceType === "video") {
      // Progress is handled by onTimeUpdate for video
      if (videoRef.current) {
        if (!isPaused) {
          videoRef.current
            .play()
            .catch((e) => console.error("Video play failed:", e));
        } else {
          videoRef.current.pause();
        }
      }
    } else {
      // For images
      const startTime = Date.now();
      // Adjust start time based on current progress if we were pausing/resuming ideally,
      // but simplistic pause is fine: just don't increment.

      progressInterval = setInterval(() => {
        if (isPaused) return;

        // We can't rely on startTime if we pause.
        // Better: increment progress.
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 100;
          }
          return prev + (50 / STATUS_DURATION) * 100;
        });
      }, 50);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [currentIndex, currentStatus, isPaused]);

  useEffect(() => {
    // Handle video pause/play based on isPaused changes efficiently
    if (currentStatus?.resourceType === "video" && videoRef.current) {
      if (isPaused) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
    }
  }, [isPaused, currentStatus]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  const handleSendReply = () => {
    if (!reply.trim()) return;

    const targetUserId = currentStatus.userId;
    if (!targetUserId || targetUserId === user?._id) return; // Can't reply to self

    // Find existing conversation
    let roomId = "";
    if (conversations) {
      // Try to find direct conversation
      const existing = conversations.find(
        (c) =>
          !c.title && // Assuming simple direct chats don't have custom titles or we check participants
          c.participants.length === 2 &&
          c.participants.some((p) => p._id === targetUserId)
      );
      if (existing) {
        roomId = existing._id || existing.roomId;
      }
    }

    if (!roomId) {
      // Construct local roomId or let backend handle it via initiate-chat
      // We will try initiate-chat which is safer
      const ids = [user._id, targetUserId].sort();
      roomId = `direct:${ids[0]}:${ids[1]}`;
    }

    // We proceed to send. If the room doesn't exist server-side,
    // usually we need initiate-chat depending on backend logic.
    // Based on ConversationContext, initiate-chat is used.
    // We'll optimistically emit 'initiate-chat' then 'send-message' or just 'send-message'
    // if the backend supports upsert.
    // Let's safe-guard: emit initiate-chat first.

    emit(
      "initiate-chat",
      { userId: user._id, contactId: targetUserId, room: roomId },
      (ack: any) => {
        const finalRoomId = ack?.conversationId || roomId;

        // Prepare tagged message payload representing the status
        const taggedMessage = {
          _id: currentStatus._id,
          from: { _id: currentStatus.userId }, // Mimic message from structure
          message:
            currentStatus.caption ||
            (currentStatus.resourceType === "video"
              ? "Video Status"
              : "Photo Status"),
          attachments: [
            {
              url: currentStatus.url,
              format: currentStatus.resourceType === "video" ? "mp4" : "jpg", // approximate
              type: currentStatus.resourceType,
            },
          ],
        };

        const tempId = Date.now().toString();

        const payload = {
          tempId,
          roomId: finalRoomId,
          message: reply,
          from: user?._id,
          taggedMessage: taggedMessage, // Pass the custom object
        };

        const optimisticMessage: ChatMessage = {
          id: tempId,
          tempId,
          conversationId: finalRoomId,
          from: {
            _id: user._id,
            displayName: user?.displayName,
            email: user?.email,
            profilePic: user?.profilePic,
          },
          message: reply,
          ts: new Date().toISOString(),
          status: "sending",
          taggedMessage: taggedMessage,
          attachments: [],
        };

        // Optimistic UI Update
        if (activeRoomId === finalRoomId) {
          setSentMessages((prev) => [
            ...(Array.isArray(prev) ? prev : []),
            optimisticMessage,
          ]);
        }

        setConversations((prev) => {
          if (!prev) return prev;
          const targetIndex = prev.findIndex(
            (c) => c._id === finalRoomId || c.roomId === finalRoomId
          );
          if (targetIndex === -1) return prev;

          const updatedConversation = {
            ...prev[targetIndex],
            lastMessage: {
              ...prev[targetIndex].lastMessage,
              from: user._id,
              message: reply,
              ts: new Date().toISOString(),
              status: "sending",
            },
            updatedAt: new Date().toISOString(),
          };

          const newConversations = [...prev];
          newConversations.splice(targetIndex, 1);
          newConversations.unshift(updatedConversation);
          return newConversations;
        });

        // Clear reply immediately for better UX
        setReply("");
        setIsPaused(false);

        emit("send-message", payload, (sendAck: any) => {
          // Handle ack (e.g. update status to sent)
          if (activeRoomId === finalRoomId) {
            setSentMessages((prev) => {
              if (!Array.isArray(prev)) return prev;
              return prev.map((m) =>
                m.id === tempId || m.tempId === tempId
                  ? {
                      ...m,
                      status: sendAck?.status === "error" ? "failed" : "sent",
                      id: sendAck?.payload?._id || m.id,
                    }
                  : m
              );
            });
          }
        });
      }
    );
  };

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black flex flex-col h-dvh w-screen animate-in fade-in duration-200">
      {/* Progress Bars */}
      <div className="absolute top-4 left-0 right-0 z-30 px-4 flex gap-2">
        {statuses.map((s, index) => (
          <div
            key={s._id}
            className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width:
                  index === currentIndex
                    ? `${progress}%`
                    : index < currentIndex
                    ? "100%"
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header Controls */}
      <div className="absolute top-8 left-0 right-0 z-20 px-4 flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <div className="text-white flex gap-2 items-center text-sm">
            <img
              src={profilePic}
              alt={displayName}
              className="w-10 h-10 object-cover rounded-full"
            />
            <div>
              <h2>{displayName}</h2>
              <span>{relativeTime}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
        >
          <LucideX size={24} />
        </button>
      </div>

      {/* Navigation Areas */}
      <div className="absolute inset-0 flex z-10">
        <div className="w-1/3 h-full" onClick={handlePrevious} />
        <div className="w-1/3 h-full" onClick={handleNext} />
        <div className="w-1/3 h-full" onClick={handleNext} />
      </div>

      {/* Media Content */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black pb-16">
        {currentStatus.resourceType === "image" ? (
          <img
            src={currentStatus.url}
            alt={currentStatus.caption || "Status"}
            className="max-h-full max-w-full object-contain"
          />
        ) : currentStatus.resourceType === "video" ? (
          <video
            ref={videoRef}
            src={currentStatus.url}
            className="max-h-full max-w-full object-contain"
            playsInline
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            // Muted is often required for autoplay, but for stories users usually expect sound.
            // We'll leave it unmuted but error handling is in play() catch.
          />
        ) : (
          <div className="text-white">Unsupported media type</div>
        )}
      </div>

      {/* Caption (if present, above input) */}
      {currentStatus.caption && (
        <div className="absolute bottom-20 left-0 right-0 p-4 text-center z-20 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm p-2 rounded-lg inline-block max-w-[80%] pointer-events-auto">
            <p className="text-white text-lg font-medium">
              {currentStatus.caption}
            </p>
          </div>
        </div>
      )}

      {/* Reply Input */}
      {currentStatus.userId !== user?._id && (
        <div className="absolute bottom-0 left-0 right-0 p-3 z-40 bg-black/60 backdrop-blur-md flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-white placeholder:text-white/60 focus:outline-none focus:border-white/80 transition-colors"
            placeholder="Reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => !reply && setIsPaused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendReply();
            }}
          />
          <button
            onClick={handleSendReply}
            disabled={!reply.trim()}
            className="p-2 bg-sky-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-600 transition-colors"
          >
            <LuSendHorizontal size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusViewer;
