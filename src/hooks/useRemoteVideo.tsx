import { RefObject, useEffect } from "react";

const useRemoteVideo = (
  videoRef: RefObject<HTMLVideoElement>,
  stream: MediaStream | null
) => {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
};

export default useRemoteVideo;
