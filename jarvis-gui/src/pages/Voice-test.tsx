import { useState, useRef } from "react";
import { useChatStore } from "../store/chatStore";
import { streamChat } from "../helper/streamChat";


import { useStreamingTTS } from "../hooks/useStreamingTTS";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

export default function VoiceTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const startTimeRef = useRef<number>(0);

  const { addUserMessage, addAssistantMessage, appendToLastMessage, setLoading } =
    useChatStore();


  const { enqueue, interrupt } = useStreamingTTS();
  const { recordAndTranscribe } = useVoiceRecorder();
  



  const handleClick = async () => {
    try {
      if (isProcessing) return;

      if (!isRecording) {
        interrupt();
        setIsRecording(true);
        startTimeRef.current = Date.now();
        return;
      }

      const duration = Date.now() - startTimeRef.current;

      if (duration < 1200) {
        alert("Speak longer");
        return;
      }

      setIsRecording(false);
      setIsProcessing(true);

      const userText = await recordAndTranscribe();

      addUserMessage(userText);
      addAssistantMessage("");

      let buffer = "";

      await streamChat(
        userText,
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