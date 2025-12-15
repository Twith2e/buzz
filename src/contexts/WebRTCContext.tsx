import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { useUserContext } from "@/contexts/UserContext";
import { CallType, IncomingCall } from "@/utils/types";

/* ------------------ TYPES ------------------ */

type CallState = "idle" | "calling" | "ringing" | "connected";

type WebRTCContextType = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callState: CallState;
  startCall: (to: string, type: CallType) => Promise<void>;
  acceptCall: (
    offer: RTCSessionDescriptionInit,
    from: string,
    type: CallType
  ) => Promise<void>;
  endCall: () => void;
  rejectCall: () => void;
  callType: CallType | null;
  incomingCall: IncomingCall | null;
  peerId: string | null;
  showDialog: boolean;
};

/* ------------------ CONTEXT ------------------ */

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const useWebRTC = () => {
  const ctx = useContext(WebRTCContext);
  if (!ctx) {
    throw new Error("useWebRTC must be used inside WebRTCProvider");
  }
  return ctx;
};

/* ------------------ PROVIDER ------------------ */

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
  const { emit, on } = useSocketContext();
  const { user } = useUserContext();

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [callType, setCallType] = useState<CallType | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  /* ------------------ MEDIA ------------------ */

  async function getMedia(type: CallType) {
    if (localStream) return localStream;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });

    setLocalStream(stream);
    return stream;
  }

  /* ------------------ PEER CONNECTION ------------------ */

  function createPeerConnection(stream: MediaStream, to: string) {
    const pc = new RTCPeerConnection(ICE_CONFIG);
    pcRef.current = pc;

    // Add local tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Remote stream
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        console.log("Received remote stream:", stream.id, stream.getTracks());
        stream.onremovetrack = () => {
          console.log("Track removed");
          // Force update if needed? Usually not needed if srcObject is same.
        };
        setRemoteStream(stream);
      }
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit("webrtc:ice-candidate", {
          from: user?._id,
          to,
          candidate: event.candidate,
        });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      console.log("WebRTC Connection State:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setCallState("connected");
      }
    };

    return pc;
  }

  /* ------------------ CALLER ------------------ */

  async function startCall(to: string, type: CallType) {
    setPeerId(to);
    setCallState("calling");

    const stream = await getMedia(type);
    const pc = createPeerConnection(stream, to);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    emit("call:offer", {
      from: user?._id,
      to,
      offer,
      type,
    });
  }

  /* ------------------ RECEIVER ------------------ */

  async function acceptCall(offer: RTCSessionDescriptionInit, from: string) {
    setPeerId(from);
    setCallState("ringing");

    if (!callType) return;

    const stream = await getMedia(callType ?? "audio");
    const pc = createPeerConnection(stream, from);

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    emit("webrtc:answer", {
      from: user?._id,
      to: from,
      answer,
    });

    setIncomingCall(null);
    setCallType(null);
    setCallState("connected");
    setShowDialog(false);
  }

  /* ------------------ SIGNAL HANDLERS ------------------ */

  useEffect(() => {
    const offIncoming = on("call:incoming", ({ from, type, offer }) => {
      console.log("incoming: ", from, type);

      setIncomingCall((prev) => prev ?? { from, type, offer });
      setCallType(type);
      setCallState("ringing");
      setShowDialog(true);
    });

    const offWebRtcOffer = on("webrtc:offer", async ({ from, offer, type }) => {
      setCallState("ringing");
      setIncomingCall((prev) =>
        prev ? { ...prev, offer } : { from, type, offer }
      );
      await pcRef.current?.setRemoteDescription(offer);
    });

    const offAnswer = on("webrtc:answer", async ({ from, answer }) => {
      setCallState("connected");
      await pcRef.current?.setRemoteDescription(answer);
    });

    const offIceCandidate = on(
      "webrtc:ice-candidate",
      async ({ from, candidate }) => {
        if (candidate) {
          await pcRef.current?.addIceCandidate(candidate);
        }
      }
    );

    const offCallEnd = on("call:end", () => {
      endCall();
    });

    return () => {
      offIncoming();
      offWebRtcOffer();
      offAnswer();
      offIceCandidate();
      offCallEnd();
    };
  }, [on, peerId, localStream]);

  /* ------------------ CLEANUP ------------------ */

  function endCall() {
    if (peerId) {
      emit("call:end", { to: peerId });
    }

    pcRef.current?.close();
    pcRef.current = null;

    localStream?.getTracks().forEach((track) => track.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setPeerId(null);
    setCallType(null);
    setIncomingCall(null);
    setCallState("idle");
    setShowDialog(false);
  }

  function rejectCall() {
    if (!incomingCall) return;

    emit("call:end", {
      from: user?._id,
      to: incomingCall.from,
    });

    setIncomingCall(null);
    setCallState("idle");
    setCallType(null);
    setShowDialog(false);
  }

  return (
    <WebRTCContext.Provider
      value={{
        localStream,
        remoteStream,
        callState,
        startCall,
        acceptCall,
        endCall,
        rejectCall,
        callType,
        incomingCall,
        peerId,
        showDialog,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};
