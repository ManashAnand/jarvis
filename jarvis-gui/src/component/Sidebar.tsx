export default function Sidebar() {
  return (
    <div className="w-65 bg-[#0b0f17] border-r border-gray-800 flex flex-col">
      <div className="p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">
          J
        </div>
        <span className="text-lg font-semibold text-white">Jarvis</span>
      </div>

      <div className="px-3">
        <button className="w-full bg-[#111827] hover:bg-[#1f2937] text-white py-2 rounded-lg border border-gray-700">
          + New chat
        </button>
      </div>

      <div className="mt-4 px-3">
        <div className="bg-[#1f2937] text-white p-2 rounded-lg">
          hi
        </div>
      </div>

      <div className="mt-auto p-3 text-xs text-gray-400">
        Jarvis • Mock streaming demo
      </div>
    </div>
  );
}