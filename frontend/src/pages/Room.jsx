import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../socket";
import Timer from "../components/Timer";
import ChatBox from "../components/ChatBox";
import VideoCall from "../components/VideoCall";
import UserPresence from "../components/UserPresence";
import FocusStreak from "../components/FocusStreak";
import BreakGame from "../components/BreakGame";
import RoomLock from "../components/RoomLock";
import Settings from "../components/Settings";
import MusicPlayer from "../components/MusicPlayer";
import FileUpload from "../components/FileUpload";
import CollaborativeNotes from "../components/CollaborativeNotes";
import { Bell, Settings as SettingsIcon, LogOut, Music, FileText, Palette } from "lucide-react";

export default function Room() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const username = searchParams.get("username");
  const isHost = searchParams.get("host") === "true";
  
  // Timer and session state
  const [state, setState] = useState({ mode: "idle", secondsLeft: 1500 });
  const [isRunning, setIsRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  
  // Users and room state
  const [users, setUsers] = useState([]);
  const [focusStreak, setFocusStreak] = useState({ streak: 0, energy: 0, totalSessions: 0 });
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  
  // Settings and features state
  const [notifications, setNotifications] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState("none");
  const [ambientTheme, setAmbientTheme] = useState("default");
  const [musicVolume, setMusicVolume] = useState(50);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  
  // File and notes state
  const [sharedFiles, setSharedFiles] = useState([]);
  const [collaborativeNotes, setCollaborativeNotes] = useState("");
  const [activeCollaborators, setActiveCollaborators] = useState([]);

  useEffect(() => {
    if (!username) {
      navigate("/");
      return;
    }

    socket.connect();
    socket.emit("join_room", { roomId: id, username, isHost });
    
    socket.on("timer_update", (s) => {
      setState(s);
      setIsBreakMode(s.mode === "break");
      setIsRunning(s.mode === "focus" || s.mode === "break");
      
      // Play notification sound and show browser notification
      if (notifications && s.mode === "break" && s.secondsLeft === 300) {
        playNotificationSound();
        showBrowserNotification("Break time! 🎉", "Great job! Take a 5-minute break.");
      } else if (notifications && s.mode === "focus" && s.secondsLeft === 1500) {
        playNotificationSound();
        showBrowserNotification("Focus time! 🎯", "Time to get back to work!");
      }
    });

    socket.on("user_joined", (userData) => {
      setUsers(prev => [...prev, userData]);
      // Only add to active collaborators if they're not the current user
      if (userData.id !== socket.id) {
        setActiveCollaborators(prev => {
          const exists = prev.find(c => c.id === userData.id);
          if (!exists) {
            return [...prev, { name: userData.name, id: userData.id, activity: 'joined' }];
          }
          return prev;
        });
      }
    });

    socket.on("user_left", (userId) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setActiveCollaborators(prev => prev.filter(user => user.id !== userId));
    });

    socket.on("users_update", (usersList) => {
      setUsers(usersList);
      // Update active collaborators based on real collaboration
      const collaborators = usersList
        .filter(user => user.id !== socket.id && user.isOnline)
        .map(user => ({ 
          name: user.name, 
          id: user.id, 
          activity: user.currentActivity || 'online' 
        }));
      setActiveCollaborators(collaborators);
    });

    socket.on("focus_streak_update", (streakData) => {
      setFocusStreak(streakData);
    });

    socket.on("room_lock_update", ({ isLocked }) => {
      setIsRoomLocked(isLocked);
    });

    socket.on("room_locked", () => {
      alert("This room is locked by the host. You cannot join at this time.");
      navigate("/");
    });

    // New socket events for enhanced features
    socket.on("music_change", ({ playlist, youtubeUrl }) => {
      setCurrentPlaylist(playlist);
      if (youtubeUrl) {
        // Handle YouTube URL if needed
        console.log("YouTube URL received:", youtubeUrl);
      }
    });

    socket.on("ambient_change", ({ theme }) => {
      setAmbientTheme(theme);
    });

    socket.on("file_upload", (fileData) => {
      setSharedFiles(prev => {
        // Check if file already exists to prevent duplicates
        const exists = prev.find(file => file.id === fileData.id);
        if (exists) return prev;
        return [...prev, fileData];
      });
    });

    socket.on("file_delete", (fileId) => {
      setSharedFiles(prev => prev.filter(file => file.id !== fileId));
    });

    socket.on("notes_update", ({ notes, userId, username }) => {
      setCollaborativeNotes(notes);
      // Only update active collaborators for real collaboration
      if (userId && userId !== socket.id) {
        setActiveCollaborators(prev => {
          const exists = prev.find(c => c.id === userId);
          if (!exists) {
            return [...prev, { id: userId, name: username || "Anonymous", activity: 'editing notes' }];
          } else {
            return prev.map(c => 
              c.id === userId 
                ? { ...c, activity: 'editing notes' }
                : c
            );
          }
        });
      }
    });

    return () => {
      socket.emit("leave_room", { roomId: id, username });
      socket.disconnect();
    };
  }, [id, username, isHost, navigate, notifications]);

  const handleStart = () => {
    socket.emit("start_timer", { roomId: id });
    setIsRunning(true);
  };

  const handlePause = () => {
    socket.emit("pause_timer");
    setIsRunning(false);
  };

  const handleStop = () => {
    socket.emit("stop_timer");
    setIsRunning(false);
  };

  const handleMusicChange = (playlist) => {
    setCurrentPlaylist(playlist);
    socket.emit("music_change", { roomId: id, playlist });
  };

  const handleAmbientChange = (theme) => {
    setAmbientTheme(theme);
    socket.emit("ambient_change", { roomId: id, theme });
    // Apply theme to body
    document.body.className = `theme-${theme}`;
  };

  const handleVolumeChange = (volume) => {
    setMusicVolume(volume);
  };

  const handleMuteToggle = (muted) => {
    setIsMusicMuted(muted);
  };

  const handleFileUpload = (fileData) => {
    socket.emit("file_upload", { roomId: id, fileData });
  };

  const handleFileDelete = (fileId) => {
    socket.emit("file_delete", { roomId: id, fileId });
  };

  const handleFileDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNotesChange = (notes) => {
    setCollaborativeNotes(notes);
    socket.emit("notes_update", { roomId: id, notes, userId: socket.id });
  };

  const playNotificationSound = () => {
    const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT");
    audio.play().catch(() => {}); // Ignore errors if audio fails to play
  };

  const showBrowserNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room", { roomId: id, username });
    navigate("/");
  };

  const toggleRoomLock = () => {
    socket.emit("toggle_room_lock");
  };

  // Apply ambient theme
  useEffect(() => {
    document.body.className = `theme-${ambientTheme}`;
  }, [ambientTheme]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                study.roomie
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Room:</span>
                <span className="bg-indigo-600 px-2 py-1 rounded font-mono">{id}</span>
                {isHost && <span className="bg-green-600 px-2 py-1 rounded text-xs">Host</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setNotifications(!notifications)}
                className={`p-2 rounded-lg transition-colors ${
                  notifications ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
                title={notifications ? 'Notifications ON' : 'Notifications OFF'}
              >
                <Bell size={20} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <SettingsIcon size={20} />
              </button>
              <button
                onClick={leaveRoom}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="Leave Room"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <UserPresence users={users} />
            <FocusStreak {...focusStreak} />
            <RoomLock 
              isLocked={isRoomLocked} 
              isHost={isHost} 
              onToggleLock={toggleRoomLock} 
            />
            <MusicPlayer 
              currentPlaylist={currentPlaylist}
              isHost={isHost}
              onPlaylistChange={handleMusicChange}
              volume={musicVolume}
              isMuted={isMusicMuted}
              onVolumeChange={handleVolumeChange}
              onMuteToggle={handleMuteToggle}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <Timer 
                secondsLeft={state.secondsLeft} 
                mode={state.mode}
                isRunning={isRunning}
                onStart={handleStart}
                onPause={handlePause}
                onStop={handleStop}
              />
            </div>

            {/* Video Call */}
            <VideoCall roomId={id} username={username} socket={socket} />
            
            {/* Collaborative Notes */}
            <CollaborativeNotes 
              notes={collaborativeNotes}
              onNotesChange={handleNotesChange}
              collaborators={activeCollaborators}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <ChatBox 
              roomId={id} 
              isBreakMode={isBreakMode} 
            />
            <BreakGame enabled={isBreakMode} />
            <FileUpload 
              files={sharedFiles}
              onFileUpload={handleFileUpload}
              onFileDelete={handleFileDelete}
              onFileDownload={handleFileDownload}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isHost={isHost}
        onMusicChange={handleMusicChange}
        onAmbientChange={handleAmbientChange}
        musicVolume={musicVolume}
        isMusicMuted={isMusicMuted}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
      />
    </div>
  );
}
