import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { useUserContext } from "@/contexts/UserContext";

/* ------------------ TYPES ------------------ */

type CallState = "idle" | "calling" | "ringing" | "connected";

type WebRTCContextType = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callState: CallState;
  startCall: (to: string) => Promise<void>;
  acceptCall: (offer: RTCSessionDescriptionInit, from: string) => Promise<void>;
  endCall: () => void;
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
  const [peerId, setPeerId] = useState<string | null>(null);

  /* ------------------ MEDIA ------------------ */

  async function getMedia() {
    if (localStream) return localStream;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
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
    const remote = new MediaStream();
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remote.addTrack(track);
      });
      setRemoteStream(remote);
    };

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit("ice-candidate", {
          from: user?._id,
          to,
          candidate: event.candidate,
        });
      }
    };

    // Connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallState("connected");
      }
    };

    return pc;
  }

  /* ------------------ CALLER ------------------ */

  async function startCall(to: string) {
    setPeerId(to);
    setCallState("calling");

    const stream = await getMedia();
    const pc = createPeerConnection(stream, to);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    emit("offer", {
      from: user?._id,
      to,
      offer,
    });
  }

  /* ------------------ RECEIVER ------------------ */

  async function acceptCall(offer: RTCSessionDescriptionInit, from: string) {
    setPeerId(from);
    setCallState("ringing");

    const stream = await getMedia();
    const pc = createPeerConnection(stream, from);

    await pc.setRemoteDescription(offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    emit("answer", {
      from: user?._id,
      to: from,
      answer,
    });
  }

  /* ------------------ SIGNAL HANDLERS ------------------ */

  useEffect(() => {
    const offAnswer = on("answer", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(answer);
    });

    const offIceCandidate = on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await pcRef.current?.addIceCandidate(candidate);
      }
    });

    const offCallEnd = on("call-end", () => {
      endCall();
    });

    return () => {
      offAnswer();
      offIceCandidate();
      offCallEnd();
    };
  }, []);

  /* ------------------ CLEANUP ------------------ */

  function endCall() {
    pcRef.current?.close();
    pcRef.current = null;

    localStream?.getTracks().forEach((track) => track.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setPeerId(null);
    setCallState("idle");
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
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};
