import { useState } from "react";

const useMediaStream = () => {
  const mediaOnboarded: boolean =
    JSON.parse(localStorage.getItem("mediaOnboarded")) === true;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(mediaOnboarded);

  async function requestMediaDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(stream);
      setHasPermission(true);
      localStorage.setItem("mediaOnboarded", "true");
      stream.getTracks().forEach((track) => track.stop());
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      return null;
    }
  }

  function stopMedia() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setHasPermission(false);
      localStorage.removeItem("mediaOnboarded");
    }
  }

  return {
    mediaOnboarded,
    requestMediaDevices,
    stream,
    hasPermission,
    stopMedia,
  };
};

export default useMediaStream;
