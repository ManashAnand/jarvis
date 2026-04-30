import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false);

  const handleClick = async () => {
    try {
      if (!isRecording) {
        await invoke("start_recording");
        setIsRecording(true);
      } else {
        const path = await invoke("stop_recording");
        console.log("Saved at:", path);
        alert("Saved at: " + path);
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
