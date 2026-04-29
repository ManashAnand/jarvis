import { useState } from "react";
import { Link } from "react-router-dom";

export default function ChatInput({
  onSend,
  loading,
}: {
  onSend: (msg: string) => void;
  loading: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="p-4 border-t border-gray-800 bg-[#0b0f17]">
      <div className="flex items-center bg-[#111827] rounded-full px-4 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Jarvis..."
          className="flex-1 bg-transparent outline-none text-white"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className="ml-3 bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full"
        >
          ➤
        </button>
        <Link to={'/voice'} className="p-2 bg-blue-400 text-white">Voice</Link>
      </div>
    </div>
  );
}