export default function TimerControls({
    mode,
    secondsLeft,
    onStart,
    onPause,
    onResume,
    onStop,
  }) {
    const safeTime = Math.max(0, secondsLeft || 0);
    const minutes = String(Math.floor(safeTime / 60)).padStart(2, "0");
    const seconds = String(safeTime % 60).padStart(2, "0");
  
    return (
      <div className="text-center">
        <h1 className="text-6xl font-mono text-indigo-400 mb-8">
          {minutes}:{seconds}
        </h1>
  
        {/* START button only in idle mode */}
        {mode === "idle" && (
          <button
            onClick={onStart}
            className="bg-indigo-500 px-6 py-2 rounded hover:bg-indigo-600"
          >
            Start
          </button>
        )}
  
        {/* FOCUS mode: show PAUSE and STOP */}
        {mode === "focus" && (
          <div className="space-x-4">
            <button
              onClick={onPause}
              className="bg-yellow-500 px-6 py-2 rounded hover:bg-yellow-600"
            >
              Pause
            </button>
            <button
              onClick={onStop}
              className="bg-red-500 px-6 py-2 rounded hover:bg-red-600"
            >
              Stop
            </button>
          </div>
        )}
  
        {/* PAUSED mode: show RESUME and STOP */}
        {mode === "paused" && (
          <div className="space-x-4">
            <button
              onClick={onResume}
              className="bg-green-500 px-6 py-2 rounded hover:bg-green-600"
            >
              Resume
            </button>
            <button
              onClick={onStop}
              className="bg-red-500 px-6 py-2 rounded hover:bg-red-600"
            >
              Stop
            </button>
          </div>
        )}
  
        {/* BREAK mode: just show STOP */}
        {mode === "break" && (
          <div className="space-x-4">
            <button
              onClick={onStop}
              className="bg-red-500 px-6 py-2 rounded hover:bg-red-600"
            >
              Stop
            </button>
          </div>
        )}
      </div>
    );
  }
  