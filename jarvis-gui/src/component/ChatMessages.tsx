import { useChatStore } from "../store/chatStore";


export default function ChatMessages() {

    const { messages } = useChatStore();
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#020617]">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 ${
            msg.role === "user" ? "justify-end" : ""
          }`}
        >
          {msg.role === "assistant" && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              🤖
            </div>
          )}

          <div
            className={`max-w-[60%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-green-600 text-white rounded-br-none"
                : "bg-[#1f2937] text-gray-200 rounded-bl-none"
            }`}
          >
            {msg.content}
          </div>

          {msg.role === "user" && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              👤
            </div>
          )}
        </div>
      ))}
    </div>
  );
}