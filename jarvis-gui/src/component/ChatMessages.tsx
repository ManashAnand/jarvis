import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStore } from "@/store/chatStore";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export default function ChatMessages() {
  const { messages } = useChatStore() as { messages: Message[] };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const typingDots = {
    animate: {
      y: [0, -8, 0],
    },
    transition: {
      duration: 1.4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const avatarVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 12,
      },
    },
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      {/* 1. Background Image Layer */}
      {/* <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/wallpaper.png')", // Ensure bg.jpg is in your public folder
        }}
      >
        <div className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[1px]" />
      </div> */}

      {/* 3. Main Chat Container */}
      <motion.div
        className="relative z-10 h-full overflow-y-auto p-6 space-y-4 custom-scrollbar"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {messages.length === 0 ? (
          <motion.div
            variants={messageVariants}
            className="flex items-center justify-center h-full text-gray-400"
          >
            <p className="text-center bg-black/20 px-6 py-2 rounded-full backdrop-blur-md border border-white/5">
              Start a conversation...
            </p>
          </motion.div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={msg.id || i}
              variants={messageVariants}
              className={`flex items-end gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Assistant Avatar */}
              {msg.role === "assistant" && (
                <motion.div
                  variants={avatarVariants}
                  className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg z-20"
                >
                  <span className="text-lg">🤖</span>
                </motion.div>
              )}

              {/* 4. Glassmorphism Message Bubble */}
              <motion.div
                variants={contentVariants}
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm overflow-hidden backdrop-blur-xl border shadow-xl ${
                  msg.role === "user"
                    ? "bg-green-600/30 border-green-400/20 text-white rounded-br-none shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                    : "bg-gray-800/40 border-white/10 text-gray-100 rounded-bl-none shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
                }`}
              >
                {msg.isLoading ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <motion.span
                      animate={typingDots.animate}
                      transition={{ ...typingDots.transition, delay: 0 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.span
                      animate={typingDots.animate}
                      transition={{ ...typingDots.transition, delay: 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                    <motion.span
                      animate={typingDots.animate}
                      transition={{ ...typingDots.transition, delay: 0.4 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none prose-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => (
                          <p
                            className="mb-2 last:mb-0 leading-relaxed"
                            {...props}
                          />
                        ),
                        // Optimized Code Component for Glass Look
                        code: ({ node, ...props }) => {
                          const { className, children } = props as any;
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match;

                          return isInline ? (
                            <code
                              className="bg-black/40 px-1.5 py-0.5 rounded text-xs font-mono text-green-300"
                              {...props}
                            />
                          ) : (
                            <code
                              className="block bg-black/40 p-3 rounded text-xs font-mono text-green-300 overflow-x-auto my-2"
                              {...props}
                            />
                          );
                        },
                        pre: ({ node, ...props }) => (
                          <pre
                            className="bg-black/30 backdrop-blur-md p-3 rounded-lg border border-white/5 my-2 overflow-x-auto"
                            {...props}
                          />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-lg font-bold mt-3 mb-2"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-base font-bold mt-2 mb-1.5"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-sm font-bold mt-2 mb-1"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-inside space-y-1 my-2 ml-2"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal list-inside space-y-1 my-2 ml-2"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-relaxed" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote
                            className="border-l-4 border-green-500 pl-3 italic text-gray-300 my-2"
                            {...props}
                          />
                        ),
                        a: ({ node, ...props }) => (
                          <a
                            className="text-green-400 hover:text-green-300 underline"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </motion.div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <motion.div
                  variants={avatarVariants}
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg z-20"
                >
                  <span className="text-lg">👤</span>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
