import { Zap, Flame, Target } from "lucide-react";

export default function FocusStreak({ streak = 0, energy = 0, totalSessions = 0 }) {
  const energyPercentage = Math.min(energy, 100);
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">Focus Streak</h3>
      </div>

      <div className="space-y-4">
        {/* Streak Counter */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Current Streak</span>
          </div>
          <span className="text-2xl font-bold text-orange-400">{streak}</span>
        </div>

        {/* Energy Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Energy Level</span>
            <span className="text-sm text-gray-300">{energyPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-yellow-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${energyPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Total Sessions</span>
          </div>
          <span className="text-xl font-bold text-blue-400">{totalSessions}</span>
        </div>

        {/* Motivational Message */}
        {streak > 0 && (
          <div className="text-center p-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-medium">
              {streak >= 5 ? "🔥 Amazing streak! Keep it up!" :
               streak >= 3 ? "💪 Great momentum! You're on fire!" :
               "✨ Nice start! Every session counts!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 