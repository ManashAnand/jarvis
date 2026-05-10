import VoiceTest from "@/pages/Voice-test";
import { motion } from "framer-motion";
import { Plus, X, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {useChatStore,Attachment} from "@/store/chatStore"



export default function ChatInput({
  onSend,
  loading,
}: {
  onSend: (
    msg?: string,
   attachments?: Attachment[]
  ) => void;
  loading: boolean;
}) {
  const [message, setMessage] = useState("");
  const {
    attachments,
    addAttachment,
    removeAttachment,
    clearAttachments,
  } = useChatStore();

  const handleSend = () => {
    if (
        !message.trim() &&
        attachments.length === 0
      ) {
        return;
      }
    onSend(message, attachments);

    setMessage("");
    clearAttachments();
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
      },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.1,
      transition: { type: "spring" as const, stiffness: 300, damping: 10 },
    },
    tap: {
      scale: 0.92,
    },
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check if Enter was pressed without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      // Prevent the default behavior (which is adding a new line)
      e.preventDefault();

      // Call your send function
      if (!loading && message.trim() !== "") {
        handleSend();
      }
    }
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // Reset height to calculate correctly
      textAreaRef.current.style.height = "auto";
      // Set height based on content scrollHeight
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message]); // Runs every time the text changes

  return (
   <div className="flex items-center justify-center bg-transparent p-4 relative z-10">
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="min-w-full"
  >
    {/* Main Container - The "Frosted Glass" Layer */}
    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 space-y-6 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      
     {/* Attachments Preview */}
        {attachments.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-3 flex-wrap"
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                variants={itemVariants}
                className="relative group"
              >

                {/* IMAGE */}
                {attachment.type === "image" && (
                  <img
                    src={attachment.preview}
                    className="w-20 h-20 object-cover rounded-2xl border border-white/10"
                  />
                )}

                {/* PDF */}
                {attachment.type === "pdf" && (
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white text-xs">
                    PDF
                  </div>
                )}

                {/* REMOVE BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    removeAttachment(attachment.id)
                  }
                  className="absolute -top-2 -right-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-1"
                >
                  <X size={14} className="text-white" />
                </motion.button>

              </motion.div>
            ))}
          </motion.div>
        )}

      {/* Message Input Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Input Field with Integrated Glass Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center gap-3 bg-white/5 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10 hover:border-white/20 transition-all focus-within:border-white/30 focus-within:bg-white/10 shadow-inner"
        >
          {/* Left Actions */}
         <div className="flex items-center gap-1">

            <input
              type="file"
              accept="image/*,.pdf"
              multiple
              hidden
              id="image-upload"
              onChange={(e) => {
                const files = e.target.files;

                  if (!files) return;

                  Array.from(files).forEach((file) => {
                    addAttachment(file);
                  });
              }}
            />

            <label htmlFor="image-upload">
              <motion.div
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <Plus size={20} />
              </motion.div>
            </label>

          </div>

          {/* Divider - Light version for glass */}
          <div className="w-px h-6 bg-white/10" />



          {/* Input Field */}
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/30 text-lg outline-none font-medium resize-none py-1"
          />

          {/* Voice/Mic Section */}
            <div className="relative">
              <VoiceTest
              />
            </div>

           

          {/* Send Button */}
          <motion.button
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-20"
            onClick={handleSend}
            disabled={
              loading ||
               (!message.trim() && attachments.length === 0)
            }
          >
            <Send size={20} />
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
</div>
  );
}
