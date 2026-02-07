export default function StatusBar() {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/60 backdrop-blur px-4 py-2 flex justify-between text-xs opacity-70">
      <span>version 0.1.0</span>
      <span>system stable</span>
    </div>
  );
}
