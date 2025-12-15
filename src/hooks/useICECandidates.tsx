import { useSocketContext } from "@/contexts/SocketContext";
import { RefObject, useEffect } from "react";

const useICECandidates = (
  peerConnectionRef: RefObject<RTCPeerConnection | null>,
  to: string,
  from: string
) => {
  const { emit } = useSocketContext();

  useEffect(() => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        emit("ice-candidate", {
          to,
          from,
          candidate: event.candidate,
        });
      }
    };

    pc.onicecandidate = handleIceCandidate;

    return () => {
      pc.onicecandidate = null;
    };
  }, [peerConnectionRef, to, from, emit]);
};

export default useICECandidates;
