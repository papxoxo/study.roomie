import { Lock, Unlock } from "lucide-react";

export default function RoomLock({ isLocked, isHost, onToggleLock }) {
  if (!isHost) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLocked ? (
            <Lock className="w-5 h-5 text-red-400" />
          ) : (
            <Unlock className="w-5 h-5 text-green-400" />
          )}
          <h3 className="text-lg font-semibold text-white">Room Access</h3>
        </div>
        <button
          onClick={onToggleLock}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isLocked
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isLocked ? "Unlock Room" : "Lock Room"}
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        {isLocked 
          ? "Room is locked. New participants cannot join." 
          : "Room is open. Anyone with the room ID can join."
        }
      </p>
    </div>
  );
} 