import { useEffect } from "react";

export default function Timer({ secondsLeft, mode, isRunning, onStart, onPause, onStop }) {
  // Update seconds when secondsLeft prop changes
  useEffect(() => {
    // Timer state updated
  }, [secondsLeft]);

  const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const s = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="text-center">
      <div className="text-6xl font-mono text-brand drop-shadow-md mb-8">
        {m}:{s} <span className="text-xl">{mode}</span>
      </div>
      
      {/* Timer Controls */}
      <div className="space-x-4">
        {!isRunning && secondsLeft > 0 && (
          <button
            onClick={onStart}
            className="bg-green-500 px-6 py-2 rounded hover:bg-green-600 text-white"
          >
            Start
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={onPause}
            className="bg-yellow-500 px-6 py-2 rounded hover:bg-yellow-600 text-white"
          >
            Pause
          </button>
        )}
        
        {(isRunning || (!isRunning && secondsLeft > 0)) && (
          <button
            onClick={onStop}
            className="bg-red-500 px-6 py-2 rounded hover:bg-red-600 text-white"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
