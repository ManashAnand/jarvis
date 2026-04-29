import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import VoiceChat from "./pages/Voice-test";



function App() {
 
  return (
   <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/voice" element={<VoiceChat />} />
  </Routes>
  );
}

export default App;
