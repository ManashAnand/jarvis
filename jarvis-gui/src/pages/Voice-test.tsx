import { useRef, useState } from "react";

export default function VoiceChat() {
  const [status, setStatus] = useState("idle"); 
  // idle | recording | processing | playing

  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = sendAudio;

    recorder.start();
    setStatus("recording");
    setTranscript("");
    setResponseText("");
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setStatus("processing");
  };

  const sendAudio = async () => {
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });

    const formData = new FormData();
    formData.append("file", blob, "audio.webm");

    const res = await fetch("http://localhost:8000/voice", {
      method: "POST",
      body: formData
    });

    // OPTIONAL: if you later return transcript from backend
    // const data = await res.json();

    const audioBlob = await res.blob();
    const url = URL.createObjectURL(audioBlob);

    const audio = new Audio(url);

    setStatus("playing");

    audio.onended = () => {
      setStatus("idle");
    };

    audio.play();
  };

  const getStatusUI = () => {
    switch (status) {
      case "recording":
        return { text: "🎤 Listening...", color: "green" };
      case "processing":
        return { text: "⏳ Processing...", color: "orange" };
      case "playing":
        return { text: "🔊 Speaking...", color: "blue" };
      default:
        return { text: "Idle", color: "gray" };
    }
  };

  const statusUI = getStatusUI();

  return (
    <div style={{ padding: 20 }}>
      
      {/* Status Indicator */}
      <div style={{ marginBottom: 20 }}>
        <strong style={{ color: statusUI.color }}>
          {statusUI.text}
        </strong>
      </div>

      {/* Mic animation */}
      {status === "recording" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "green",
            animation: "pulse 1s infinite"
          }} />
        </div>
      )}

      {/* Buttons */}
      <button onClick={status === "recording" ? stopRecording : startRecording}>
        {status === "recording" ? "Stop" : "Start Talking"}
      </button>

      {/* Transcript */}
      {transcript && (
        <div style={{ marginTop: 20 }}>
          <strong>You said:</strong>
          <p>{transcript}</p>
        </div>
      )}

      {/* Response */}
      {responseText && (
        <div style={{ marginTop: 20 }}>
          <strong>Assistant:</strong>
          <p>{responseText}</p>
        </div>
      )}

      {/* Simple CSS */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}