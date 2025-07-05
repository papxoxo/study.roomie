import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import TimerControls from "../components/TimerControls";

export default function Room() {
  const { id: roomId } = useParams();

  const [timerState, setTimerState] = useState({
    mode: "idle",
    secondsLeft: 0,
  });

  useEffect(() => {
    socket.connect();
    socket.emit("join_room", { roomId });

    socket.on("timer_update", (data) => {
      console.log("Timer Update:", data); // ← debug log
      setTimerState(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const start  = () => socket.emit("start_timer", { roomId });
  const pause  = () => socket.emit("pause_timer");
  const resume = () => socket.emit("resume_timer");
  const stop   = () => socket.emit("stop_timer");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <TimerControls
        mode={timerState.mode}
        secondsLeft={timerState.secondsLeft}
        onStart={() => socket.emit("start_timer", { roomId })}
        onPause={() => socket.emit("pause_timer")}
        onResume={() => socket.emit("resume_timer")}
        onStop={() => socket.emit("stop_timer")}
        />


      <div className="mt-6 text-sm text-gray-400">
        Current mode: {timerState.mode}
      </div>
    </div>
  );
}
