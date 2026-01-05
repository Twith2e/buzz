import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function VoiceWaveform({
  src,
  height = 48,
}: {
  src: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (wsRef.current) {
      try {
        wsRef.current.destroy();
      } catch (e) {}
    }

    wsRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#94a3b8",
      progressColor: "#0ea5e9",
      barWidth: 2,
      barRadius: 2,
      cursorWidth: 0,
      height,
      normalize: true,
    });

    wsRef.current.load(src);

    wsRef.current.on("play", () => setPlaying(true));
    wsRef.current.on("pause", () => setPlaying(false));
    wsRef.current.on("finish", () => setPlaying(false));

    return () => {
      try {
        wsRef.current.destroy();
      } catch (e) {}
      wsRef.current = null;
    };
  }, [src, height]);

  const toggle = () => {
    if (!wsRef.current) return;
    wsRef.current.playPause();
    setPlaying(!playing);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center"
      >
        {playing ? "⏸" : "▶"}
      </button>
      <div ref={containerRef} className="flex-1 " />
    </div>
  );
}
