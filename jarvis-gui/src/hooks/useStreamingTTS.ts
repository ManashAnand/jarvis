import { useRef } from "react";
import { api } from "../constants/constant";

export function useStreamingTTS() {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  function cleanText(text: string) {
    return text
      .replace(/[*#`]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function interrupt() {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    queueRef.current = [];
    isPlayingRef.current = false;
  }

  async function play(text: string) {
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
    currentAudioRef.current = audio;

    return new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudioRef.current = null;
        resolve();
      };
      audio.play();
    });
  }

  async function processQueue() {
    if (isPlayingRef.current) return;
    if (queueRef.current.length === 0) return;

    isPlayingRef.current = true;

    const text = queueRef.current.shift()!;
    await play(text);

    isPlayingRef.current = false;
    processQueue();
  }

  function enqueue(text: string) {
    const cleaned = cleanText(text);
    if (cleaned.length < 10) return;

    queueRef.current.push(cleaned);
    processQueue();
  }

  return { enqueue, interrupt };
}