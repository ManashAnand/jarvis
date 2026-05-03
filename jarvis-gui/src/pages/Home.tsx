import ChatHeader from "../component/ChatHeader";
import ChatMessages from "../component/ChatMessages";
import ChatInput from "../component/ChatInput";
import { streamChat } from "../helper/streamChat";
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
   <div className="flex flex-col h-full bg-transparent">
      {/* Header padding-left added to avoid overlapping with the SidebarTrigger */}
      <div className="pl-12">
        <ChatHeader />
      </div>
      
      <ChatMessages />
      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
}