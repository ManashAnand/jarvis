export default function ChatHeader() {
  return (
    <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4 bg-[#0b0f17]">
      <div className="flex items-center gap-3 text-white">
        <span className="text-xl">☰</span>
        <span className="font-semibold">Jarvis</span>
      </div>

      <div className="text-gray-400">⚙️</div>
    </div>
  );
}