import { useState, useEffect } from "react";
import { Keyboard, Trophy, Timer } from "lucide-react";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "Study hard, stay focused, and never give up on your dreams.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do."
];

export default function BreakGame({ enabled = false }) {
  const [currentText, setCurrentText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (enabled && !isPlaying) {
      setCurrentText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
    }
  }, [enabled, isPlaying]);

  useEffect(() => {
    let interval;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(60);
    setUserInput("");
    setScore(0);
    setWpm(0);
    setAccuracy(0);
  };

  const endGame = () => {
    setIsPlaying(false);
    calculateResults();
  };

  const calculateResults = () => {
    const words = currentText.split(" ").length;
    const timeInMinutes = 1; // 60 seconds
    const calculatedWpm = Math.round(words / timeInMinutes);
    
    const correctChars = [...userInput].filter((char, index) => 
      char === currentText[index]
    ).length;
    const calculatedAccuracy = Math.round((correctChars / currentText.length) * 100);
    
    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);
    setScore(calculatedWpm * calculatedAccuracy / 100);
  };

  const handleInputChange = (e) => {
    if (!isPlaying) return;
    
    const value = e.target.value;
    setUserInput(value);
    
    if (value === currentText) {
      // Text completed, end the game immediately
      endGame();
    }
  };

  if (!enabled) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Break Time Game</h3>
      </div>

      {!isPlaying ? (
        <div className="text-center space-y-4">
          <p className="text-gray-300">Type as fast as you can! 60 seconds to test your speed.</p>
          <button
            onClick={startGame}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Start Type Race
          </button>
          
          {score > 0 && (
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">Final Score: {Math.round(score)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">WPM:</span>
                  <span className="text-white ml-2 font-medium">{wpm}</span>
                </div>
                <div>
                  <span className="text-gray-400">Accuracy:</span>
                  <span className="text-white ml-2 font-medium">{accuracy}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Timer */}
          <div className="flex items-center justify-center gap-2">
            <Timer className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{timeLeft}s</span>
          </div>

          {/* Text to Type */}
          <div className="bg-gray-700 rounded-lg p-4">
            <p className="text-gray-300 leading-relaxed">{currentText}</p>
          </div>

          {/* Input */}
          <textarea
            value={userInput}
            onChange={handleInputChange}
            placeholder="Start typing here..."
            className="w-full h-24 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={!isPlaying}
          />

          {/* Progress */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Progress: {Math.round((userInput.length / currentText.length) * 100)}%</span>
            <span>Characters: {userInput.length}/{currentText.length}</span>
          </div>
        </div>
      )}
    </div>
  );
} 