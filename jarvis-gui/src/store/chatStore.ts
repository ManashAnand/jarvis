import { create } from "zustand";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatStore = {
  messages: Message[];
  loading: boolean;

  addUserMessage: (text: string) => void;
  addAssistantMessage: (text: string) => void;
  appendToLastMessage: (token: string) => void;
  setLoading: (val: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  loading: false,

  addUserMessage: (text) =>
    set((state) => ({
      messages: [...state.messages, { role: "user", content: text }],
    })),

  addAssistantMessage: (text) =>
    set((state) => ({
      messages: [...state.messages, { role: "assistant", content: text }],
    })),

  appendToLastMessage: (token) =>
    set((state) => {
      const updated = [...state.messages];
      const last = updated.length - 1;

      if (updated[last]?.role === "assistant") {
        updated[last].content += token;
      }

      return { messages: updated };
    }),

  setLoading: (val) => set({ loading: val }),
}));