import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { readFile } from "@tauri-apps/plugin-fs";
import { api } from "../constants/constant";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "../helper/streamChat";

export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number>(0);

  const { addUserMessage, addAssistantMessage, appendToLastMessage, setLoading } =
    useChatStore();

  // 🧠 TTS QUEUE SYSTEM
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // 🔊 Clean + normalize text
  function cleanText(text: string) {
    return text
      .replace(/[*#`]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 🔊 Play single audio
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

    return new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.play();
    });
  }

  // 🔁 Process queue sequentially
  async function processQueue() {
    if (isPlayingRef.current) return;
    if (queueRef.current.length === 0) return;

    isPlayingRef.current = true;

    const text = queueRef.current.shift()!;
    await playTTS(text);

    isPlayingRef.current = false;
    processQueue();
  }

  // ➕ Add to queue
  function enqueueTTS(text: string) {
    const cleaned = cleanText(text);

    if (cleaned.length < 10) return;

    queueRef.current.push(cleaned);
    processQueue();
  }

  const handleClick = async () => {
    try {
      if (isProcessing) return;

      // 🎤 START RECORDING
      if (!isRecording) {
        await invoke("start_recording");
        startTimeRef.current = Date.now();
        setIsRecording(true);
        return;
      }

      // 🛑 STOP RECORDING
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

      // 💬 UI SETUP
      addUserMessage(data.user_text);
      addAssistantMessage("");

      let buffer = "";

      await streamChat(
        data.user_text,
        (token) => {
          buffer += token;
          appendToLastMessage(token);

          // 🧠 Sentence detection
          if (/[.?!]/.test(buffer)) {
            enqueueTTS(buffer);
            buffer = "";
          }
        },
        async () => {
          setLoading(false);

          // leftover text
          if (buffer.length > 5) {
            enqueueTTS(buffer);
          }
        }
      );
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