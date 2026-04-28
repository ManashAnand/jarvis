export async function streamChat(
  input: string,
  onToken: (token: string) => void,
  onDone: () => void
) {
  const API_URL = import.meta.env.VITE_API_URL;
  const res = await fetch(`${API_URL}/chat-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_query: input }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      const data = JSON.parse(line);

      if (data.type === "token") {
        onToken(data.content);
      }

      if (data.type === "done") {
        onDone();
      }
    }
  }
}