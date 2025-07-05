import { useState } from "react";
import { Settings as SettingsIcon, Music, FileText, Palette, Volume2, VolumeX, Download, Upload } from "lucide-react";

export default function Settings({ 
  isOpen, 
  onClose, 
  isHost, 
  onMusicChange, 
  onAmbientChange,
  musicVolume,
  isMusicMuted,
  onVolumeChange,
  onMuteToggle
}) {
  const [activeTab, setActiveTab] = useState("general");

  const musicPlaylists = [
    { id: "lofi", name: "Lo-fi Beats to Study/Relax", description: "Chill lo-fi music for focus" },
    { id: "lofiRadio", name: "Chill Lo-fi Hip Hop", description: "Relaxing lo-fi hip hop beats" },
    { id: "youtubeLofi", name: "Lo-fi Study Session", description: "Perfect for study sessions" },
    { id: "rain", name: "Night Lo-fi", description: "Late night lo-fi vibes" },
    { id: "whitenoise", name: "Lo-fi Rain", description: "Lo-fi with rain sounds" },
    { id: "nature", name: "Lo-fi Coffee Shop", description: "Coffee shop lo-fi ambience" },
    { id: "custom", name: "Custom YouTube", description: "Paste any YouTube link" },
    { id: "none", name: "No Music", description: "Silent study mode" }
  ];

  const ambientThemes = [
    { id: "default", name: "Default Dark", description: "Clean dark theme" },
    { id: "ocean", name: "Ocean Blue", description: "Calming ocean vibes" },
    { id: "forest", name: "Forest Green", description: "Nature-inspired theme" },
    { id: "sunset", name: "Sunset Orange", description: "Warm sunset colors" },
    { id: "minimal", name: "Minimal", description: "Ultra-clean minimal design" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-semibold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: "general", name: "General", icon: "⚙️" },
            { id: "music", name: "Music", icon: "🎵" },
            { id: "ambient", name: "Ambient", icon: "🎨" },
            { id: "files", name: "Files", icon: "📁" },
            { id: "notes", name: "Notes", icon: "📝" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Browser Notifications</p>
                      <p className="text-gray-400 text-sm">Get notified when sessions end</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Sound Effects</p>
                      <p className="text-gray-400 text-sm">Play sounds for timer events</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Auto-Start Timer</p>
                      <p className="text-gray-400 text-sm">Automatically start next session</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "music" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Study Music</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Music Volume</p>
                      <p className="text-gray-400 text-sm">Control your music volume</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onMuteToggle(!isMusicMuted)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        {isMusicMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={musicVolume}
                        onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                        disabled={isMusicMuted}
                        className="w-24"
                      />
                      <span className="text-white text-sm w-8">{musicVolume}%</span>
                    </div>
                  </div>

                  {isHost && (
                    <div>
                      <p className="text-white font-medium mb-3">Select Playlist (Host Only)</p>
                      <div className="grid gap-3">
                        {musicPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => onMusicChange(playlist.id)}
                            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                          >
                            <div>
                              <p className="text-white font-medium">{playlist.name}</p>
                              <p className="text-gray-400 text-sm">{playlist.description}</p>
                            </div>
                            <Music className="w-5 h-5 text-indigo-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ambient" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Ambient Mode</h3>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {ambientThemes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => onAmbientChange(theme.id)}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
                      >
                        <div>
                          <p className="text-white font-medium">{theme.name}</p>
                          <p className="text-gray-400 text-sm">{theme.description}</p>
                        </div>
                        <Palette className="w-5 h-5 text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Shared Files</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-white font-medium mb-1">Upload Study Materials</p>
                    <p className="text-gray-400 text-sm">Drag & drop PDFs, images, or documents</p>
                    <button className="mt-3 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white text-sm transition-colors">
                      Choose Files
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white font-medium">Recent Files</p>
                    <div className="text-gray-400 text-sm">No files uploaded yet</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Collaborative Notes</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-medium">Shared Notes</p>
                      <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                        Clear All
                      </button>
                    </div>
                    <textarea
                      placeholder="Start typing your shared notes here..."
                      className="w-full h-32 bg-gray-600 border border-gray-500 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span>Real-time collaboration</span>
                      <span>0 characters</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 