import { useEffect, useRef, useState } from "react";

const usePeerConnection = (localStream: MediaStream) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!localStream) return;
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE Candidate:", event.candidate);
      }
    };

    return () => {
      peerConnection.close();
      peerConnectionRef.current = null;
    };
  }, [localStream]);

  async function createOffer() {
    const offer = await peerConnectionRef.current?.createOffer();
    await peerConnectionRef.current?.setLocalDescription(offer);
    return offer;
  }

  async function createAnswer() {
    const answer = await peerConnectionRef.current?.createAnswer();
    await peerConnectionRef.current?.setLocalDescription(answer);
    return answer;
  }

  async function setRemoteDescription(desc: RTCSessionDescriptionInit) {
    await peerConnectionRef.current?.setRemoteDescription(desc);
  }

  return {
    remoteStream,
    peerConnection: peerConnectionRef.current,
    createOffer,
    createAnswer,
    setRemoteDescription,
  };
};

export default usePeerConnection;
