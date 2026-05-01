import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { api } from "../constants/constant";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "../helper/streamChat";

export default function VoiceTest({  }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number>(0);

  const { addUserMessage,addAssistantMessage ,appendToLastMessage, setLoading } = useChatStore();


   async function playTTS(text: string) {
      const res = await fetch(`${api}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);

      await audio.play();
    }

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


      const data = await res.json();
      
      addUserMessage(data.user_text);
      addAssistantMessage(""); 

       let fullText = "";
      await streamChat(
        data.user_text,
        (token) => {
          fullText += token;
          appendToLastMessage(token);
        } ,
        async () => {
          setLoading(false);

          // 🔊 play TTS AFTER streaming
          const cleanText = fullText
          .replace(/[*#`]/g, "")      // remove markdown
          .replace(/\n+/g, " ")       // remove line breaks
          .trim();

          if (cleanText.length < 10) {
            console.log("Text too small for TTS, skipping");
            return;
          }
          await playTTS(cleanText);
        }
      )

    } catch (err) {
      console.error("Voice error:", err);
      alert("Something went wrong. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

 

  return (
    <div className="p-2">
      <button onClick={handleClick} disabled={isProcessing}>
        {isProcessing ? (
          <span className="animate-spin">⏳</span>
        ) : isRecording ? (
          <span>🛑</span>
        ) : (
          <span>🎤</span>
        )}
      </button>
    </div>
  );
}
