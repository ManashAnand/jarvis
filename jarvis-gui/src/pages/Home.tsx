import ChatHeader from "../component/ChatHeader";
import ChatMessages from "../component/ChatMessages";
import ChatInput from "../component/ChatInput";
import { streamChat } from "../helper/streamChat";
import Sidebar from "../component/Sidebar";
import { useChatStore } from "../store/chatStore";


export default function ChatPage() {
  const {  addUserMessage, addAssistantMessage, appendToLastMessage, setLoading, loading } = useChatStore();

  const sendMessage = async (input: string) => {
    addUserMessage(input);
    addAssistantMessage("");

    setLoading(true);

    await streamChat(
      input,
      (token) => appendToLastMessage(token),
      () => setLoading(false)
    );
  };

  return (
    <div className="h-screen flex bg-black">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <ChatMessages />
        <ChatInput onSend={sendMessage} loading={loading} />
      </div>
    </div>
  );
}