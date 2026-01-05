import { useRef, useState } from "react";

export default function useVoiceRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // reset any previous chunks
    chunksRef.current = [];
    streamRef.current = stream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.start();
    setRecording(true);
  };

  const stop = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        throw new Error("Recorder not initialized");
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });
        chunksRef.current = [];
        setRecording(false);

        // stop and release tracks
        try {
          streamRef.current?.getTracks().forEach((t) => t.stop());
        } catch (e) {}
        streamRef.current = null;
        mediaRecorderRef.current = null;

        resolve(blob);
      };

      try {
        recorder.stop();
      } catch (e) {
        // if stop fails, still try to resolve with empty blob
        const blob = new Blob([], { type: "audio/webm" });
        chunksRef.current = [];
        setRecording(false);
        resolve(blob);
      }
    });
  };

  return { start, stop, recording };
}
