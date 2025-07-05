import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users, Video, Clock, MessageCircle, Zap, BarChart3 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const createRoom = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    const id = roomId || Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${id}?username=${encodeURIComponent(currentUser.displayName || currentUser.email)}&host=true`);
  };

  const joinRoom = () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }
    navigate(`/room/${roomId}?username=${encodeURIComponent(currentUser.displayName || currentUser.email)}&host=false`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <Link
              to="/how-it-works"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
            >
              How it Works
            </Link>
          </div>
          <div className="flex gap-4">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            study.roomie
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Collaborative study rooms with video calling, shared timers, and focus features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <Video className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Video Calling</h3>
            <p className="text-gray-400 text-sm">Crystal clear video calls with your study partners</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <Clock className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Shared Timer</h3>
            <p className="text-gray-400 text-sm">Synchronized Pomodoro timer for focused sessions</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <MessageCircle className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Break Chat</h3>
            <p className="text-gray-400 text-sm">Chat with friends during break sessions</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <Zap className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Focus Streak</h3>
            <p className="text-gray-400 text-sm">Track your productivity and build momentum</p>
          </div>
        </div>

        {/* Room Controls */}
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {currentUser ? 'Join or Create Room' : 'Get Started'}
            </h2>
            
            {currentUser ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                      placeholder="Enter room ID"
                      className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
                    />
                    <button
                      onClick={generateRoomId}
                      className="px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={joinRoom}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={createRoom}
                    className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-gray-400 mb-6">
                  Sign in to create or join study rooms with your friends
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/signin"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
