import ChatHeader from "../component/ChatHeader";
import ChatMessages from "../component/ChatMessages";
import ChatInput from "../component/ChatInput";
import { streamChat } from "../helper/streamChat";
import { useChatStore,Attachment } from "../store/chatStore";


export default function Home() {
  const {
    addUserMessage,
    addAssistantMessage,
    appendToLastMessage,
    setLoading,
    loading,
    clearAttachments,
  } = useChatStore();

  const sendMessage = async (input?: string,  attachments?: Attachment[]) => {
    addUserMessage(
      input || "",
      attachments
    );
    addAssistantMessage("");

    setLoading(true);

    await streamChat(
      input,
      
      attachments,
      (token) => appendToLastMessage(token),
      () => {
        setLoading(false)
        clearAttachments()        
      }
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