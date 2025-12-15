import { useRef, useEffect } from "react";
import { useWebRTC } from "@/contexts/WebRTCContext";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CallScreen() {
  const { localStream, remoteStream, callState, endCall, callType, peerId } =
    useWebRTC();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log(
        "Attaching remote stream to video/audio element",
        remoteStream.getTracks()
      );
      remoteVideoRef.current.srcObject = remoteStream;

      // Explicitly try to play to debug autoplay issues
      remoteVideoRef.current
        .play()
        .catch((e) => console.error("Error playing remote stream:", e));
    }
  }, [remoteStream, callType]);

  if (callState === "idle" || (callState === "ringing" && !localStream)) {
    return null;
  }

  // If we are ringing (incoming) -> IncomingCallDialog handles it (unless we accepted and waiting for connection)
  // If we are calling (outgoing) -> We show this screen with "Calling..."
  // If we are connected -> Show standard call screen

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col items-center justify-center">
      {/* Remote Video (Full Screen-ish) */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {remoteStream && callType === "video" ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-3xl font-semibold">
              {peerId?.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-xl">
              {callState === "connected" ? "Connected" : "Calling..."}
            </div>
            {/* Play audio if we have a remote stream but not in video mode */}
            {remoteStream && (
              <audio
                ref={remoteVideoRef}
                autoPlay
                playsInline
                controls={false}
              />
            )}
          </div>
        )}

        {/* Local Video (PiP) */}
        {localStream && callType === "video" && (
          <div className="absolute bottom-20 right-4 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 p-4 bg-gray-800/80 rounded-full backdrop-blur-sm">
        {/* Placeholder for Mute/Video Toggles (functionality not in context yet, just UI) */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-700 text-white"
        >
          <Mic className="h-6 w-6" />
        </Button>

        {callType === "video" && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-700 text-white"
          >
            <Video className="h-6 w-6" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="icon"
          className="w-14 h-14 rounded-full"
          onClick={endCall}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
