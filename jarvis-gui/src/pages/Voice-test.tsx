import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";

export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = async () => {
    try {
      if (!isRecording) {
        await invoke("start_recording");
        setIsRecording(true);
      } else {
        const path = await invoke<string>("stop_recording");

        // read file as binary
        const fileData = await readFile(path);

        // convert to blob
        const blob = new Blob([fileData], { type: "audio/wav" });

        const formData = new FormData();
        formData.append("file", blob, "audio.wav");

        const res = await fetch("http://localhost:8000/voice", {
          method: "POST",
          body: formData
        });

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play();

        setIsRecording(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}