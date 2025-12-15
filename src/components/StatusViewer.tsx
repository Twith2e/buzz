import { formatRelativeTime } from "@/lib/utils";
import { useUserContext } from "@/contexts/UserContext";
import { Status } from "@/utils/types";
import { LucideX } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface StatusViewerProps {
  status: Array<Status>;
  onClose: () => void;
}

const STATUS_DURATION = 5000;

const StatusViewer = ({ status: statuses, onClose }: StatusViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { contactList, user } = useUserContext();

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
        videoRef.current.currentTime = 0;
        videoRef.current
          .play()
          .catch((e) => console.error("Video play failed:", e));
      }
    } else {
      // For images
      const startTime = Date.now();
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / STATUS_DURATION) * 100;

        if (newProgress >= 100) {
          handleNext();
        } else {
          setProgress(newProgress);
        }
      }, 50);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [currentIndex, currentStatus]);

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

  if (!currentStatus) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col h-[100dvh] w-screen animate-in fade-in duration-200">
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
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
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

      {/* Caption */}
      {currentStatus.caption && (
        <div className="absolute bottom-10 left-0 right-0 p-4 text-center z-20">
          <div className="bg-black/50 backdrop-blur-sm p-2 rounded-lg inline-block max-w-[80%]">
            <p className="text-white text-lg font-medium">
              {currentStatus.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusViewer;
