import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import {api} from "../constants/constant"


export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number>(0);

  const handleClick = async () => {
    try {
      if (isProcessing) return;

      if (!isRecording) {
        await invoke("start_recording");
        startTimeRef.current = Date.now();
        setIsRecording(true);
        return;
      }

      const duration = Date.now() - startTimeRef.current;

      if (duration < 1200) {
        alert("Please speak for at least 1 second");
        return;
      }

      setIsRecording(false);
      setIsProcessing(true);

      const path = await invoke<string>("stop_recording");

      await new Promise((r) => setTimeout(r, 200));

      const fileData = await readFile(path);
      const blob = new Blob([fileData], { type: "audio/wav" });

      const formData = new FormData();
      formData.append("file", blob, "audio.wav");

      const res = await fetch(`${api}/voice`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Backend error: " + res.status);
      }

      const audioBlob = await res.blob();

      if (audioBlob.size < 1000) {
        throw new Error("Empty audio response");
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error("Voice error:", err);
      alert("Something went wrong. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={isProcessing}>
        {isProcessing
          ? "Processing..."
          : isRecording
            ? "Stop Recording"
            : "Start Recording"}
      </button>
    </div>
  );
}
