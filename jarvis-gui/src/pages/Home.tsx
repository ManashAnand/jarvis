import { useState } from "react";
import { streamChat } from "../helper/streamChat";

function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);


    const sendMessage = async () => {
        setOutput("");
        setLoading(true);

        await streamChat(
            input,
            (token) => setOutput(prev => prev + token),
            () => setLoading(false)
        );
        
    }
  return (
    <>
      <div style={{ padding: 20 }}>
        <h2>Jarvis (Streaming Test)</h2>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something..."
          style={{ width: "300px", marginRight: "10px" }}
        />

        <button onClick={sendMessage}>Send</button>

        <div style={{ marginTop: 20 }}>
          <strong>Response:</strong>
          <div>{output}</div>
        </div>

        {loading && <p>Loading...</p>}
      </div>
    </>
  );
}

export default Home;
