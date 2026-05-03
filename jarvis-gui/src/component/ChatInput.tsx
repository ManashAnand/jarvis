import VoiceTest from "@/pages/Voice-test";
import { motion } from "framer-motion";
import { Plus, ArrowUp, X, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AppIcon {
  id: string;
  color: string;
  icon: React.ReactNode;
}

export default function ChatInput({
  onSend,
  loading,
}: {
  onSend: (msg: string) => void;
  loading: boolean;
}) {
  const [appIcons, setAppIcons] = useState<AppIcon[]>([
    { id: "1", color: "bg-blue-600", icon: null },
    { id: "2", color: "bg-gray-700", icon: "📋" },
  ]);
  const [message, setMessage] = useState("");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const removeIcon = (id: string) => {
    setAppIcons(appIcons.filter((icon) => icon.id !== id));
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

  const micPulse = {
    animate: isRecording
      ? {
          scale: [1, 1.15, 1],
          transition: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {
          scale: 1,
        },
  };

  const recordingDot = {
    animate: isRecording
      ? {
          opacity: [1, 0.4, 1],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        }
      : {
          opacity: 0,
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
      
      {/* App Icons Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-3"
      >
        {appIcons.map((app) => (
          <motion.div
            key={app.id}
            variants={itemVariants}
            onHoverStart={() => setHoveredIcon(app.id)}
            onHoverEnd={() => setHoveredIcon(null)}
            className="relative group"
          >
            <motion.div
              whileHover={{ y: -6 }}
              className={`${app.color} w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-lg border border-white/10 backdrop-blur-md`}
            >
              <span className="text-3xl">{app.icon}</span>
            </motion.div>

            {/* Close Button - Glass style */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: hoveredIcon === app.id ? 1 : 0,
                scale: hoveredIcon === app.id ? 0.7 : 0.2,
              }}
              whileHover={{ scale: 0.8 }}
              whileTap={{ scale: 0.4 }}
              onClick={() => removeIcon(app.id)}
              className="absolute -top-4 -right-4 bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-0.5 hover:bg-red-500/50 transition-colors shadow-md"
            >
              <X size={16} className="text-white" />
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

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
            <motion.button
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="text-white/40 hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              <Plus size={20} />
            </motion.button>
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
          <motion.button
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 rounded-lg transition-all relative ${
              isRecording
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-white/40 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <div className="relative">
              <VoiceTest
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </div>

            {/* Recording Indicator - Glowing led effect */}
            <motion.div
              variants={recordingDot}
              className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />
          </motion.button>

          {/* Send Button */}
          <motion.button
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            className="bg-white/90 hover:bg-white text-black rounded-full p-2 shadow-lg transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-20"
            onClick={handleSend}
            disabled={loading || !message.trim()}
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
