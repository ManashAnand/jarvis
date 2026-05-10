import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "../helper/streamChat";
import { useStreamingTTS } from "../hooks/useStreamingTTS";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { invoke } from "@tauri-apps/api/core";

export default function VoiceTest() {
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number>(0);
   const [isRecording, setIsRecording] = useState(false);

    const {
      addUserMessage,
      addAssistantMessage,
      appendToLastMessage,
      setLoading,
      selectedImage,
      selectedImagePreview,
      clearSelectedImage,
    } = useChatStore();

  const { enqueue, interrupt } = useStreamingTTS();
  const { recordAndTranscribe } = useVoiceRecorder();
 
  const handleClick = async () => {
    try {
      if (isProcessing) return;

      if (!isRecording) {
        interrupt();
        setIsRecording(true);
        startTimeRef.current = Date.now();

        await invoke("start_recording"); 

        return;
      }

      // ⏹ STOP RECORDING
      setIsRecording(false);
      setIsProcessing(true);

      const duration = Date.now() - startTimeRef.current;

      const path = await invoke<string>("stop_recording");

      if (duration < 1200) {
        alert("Speak longer");
        setIsProcessing(false);
        return;
      }

      const userText = await recordAndTranscribe(path); 

      if (!userText || userText.trim() === "") {
        console.log("Empty transcription");
        setIsProcessing(false);
        return;
      }

      addUserMessage(
        userText,
        selectedImagePreview || undefined
      );
      addAssistantMessage("");

      let buffer = "";

      await streamChat(
        userText,
        selectedImage || undefined,
        (token) => {
          buffer += token;
          appendToLastMessage(token);

          const sentences = buffer.split(/(?<=[.?!])/);
          if (sentences.length > 1) {
            const complete = sentences.shift();
            buffer = sentences.join("");
            if (complete) enqueue(complete);
          }
        },
        () => {
          setLoading(false);
          clearSelectedImage();
          if (buffer.length > 5) enqueue(buffer);
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative pl-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        onClick={handleClick}
        disabled={isProcessing}
        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors shadow-md ${
          isRecording
            ? "bg-red-500 text-white shadow-red-500/40"
            : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700"
        } disabled:opacity-60`}
      >
        {/* pulse rings while recording */}
        {isRecording && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500/40"
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-red-500/30"
              animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                delay: 0.4,
                ease: "easeOut",
              }}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.span>
          ) : isRecording ? (
            <motion.span
              key="stop"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Square className="w-4 h-4 fill-current" />
            </motion.span>
          ) : (
            <motion.span
              key="mic"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
