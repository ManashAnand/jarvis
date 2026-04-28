import { useState } from "react";
import ChatHeader from "../component/ChatHeader";
import ChatMessages from "../component/ChatMessages";
import ChatInput from "../component/ChatInput";
import { streamChat } from "../helper/streamChat";
import Sidebar from "../component/Sidebar";


type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (input: string) => {

    setMessages((prev) => [...prev, { role: "user", content: input }, { role: "assistant", content: "" }]);
    setLoading(true);

    await streamChat(
      input,
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated.length - 1;

          if (updated[last].role === "assistant") {
            updated[last].content += token;
          }

          return updated;
        });
      },
      () => setLoading(false)
    );
  };

  return (
    <div className="h-screen flex bg-black">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMessages messages={messages} />
        <ChatInput onSend={sendMessage} loading={loading} />
      </div>
    </div>
  );
}