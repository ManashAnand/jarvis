import { create } from "zustand";

type Message = {
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
};

export type Attachment = {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "pdf";
};

type ChatStore = {
  messages: Message[];
  loading: boolean;


  attachments: Attachment[];

  addUserMessage: (
    text: string,
    attachments?: Attachment[]
  ) => void;
  addAssistantMessage: (text: string) => void;
  appendToLastMessage: (token: string) => void;
  setLoading: (val: boolean) => void;

   addAttachment: (
    file: File
  ) => void;

  removeAttachment: (
    id: string
  ) => void;

  clearAttachments: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  loading: false,

  attachments: [],

  addUserMessage: (
    text,
    attachments
  ) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          role: "user",
          content: text,
          attachments,
        },
      ],
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

  addAttachment: (file) =>
    set((state) => {

      const type = file.type.includes("pdf")
        ? "pdf"
        : "image";

      const attachment: Attachment = {
        id: crypto.randomUUID(),
        file,
        type,
        preview:
          type === "image"
            ? URL.createObjectURL(file)
            : undefined,
      };

      return {
        attachments: [
          ...state.attachments,
          attachment,
        ],
      };
    }),
  

    removeAttachment: (id) =>
    set((state) => ({
      attachments:
        state.attachments.filter(
          (a) => a.id !== id
        ),
    })),

  clearAttachments: () =>
    set({
      attachments: [],
    }),
    
}));