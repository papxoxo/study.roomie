import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, ExternalLink, Link, Headphones, AlertCircle } from "lucide-react";

export default function MusicPlayer({ 
  currentPlaylist, 
  isHost, 
  onPlaylistChange,
  volume = 50,
  isMuted = false,
  onVolumeChange,
  onMuteToggle
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [error, setError] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  
  const audioRef = useRef(null);

  const playlists = {
    lofi: {
      name: "Lo-fi Beats to Study/Relax",
      description: "Chill lo-fi music for focus",
      tracks: [
        { 
          title: "Lo-fi Hip Hop Radio", 
          url: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0",
          artist: "YouTube Stream",
          isYouTube: true
        }
      ]
    },
    lofiRadio: {
      name: "Chill Lo-fi Hip Hop",
      description: "Relaxing lo-fi hip hop beats",
      tracks: [
        {
          title: "Chill Lo-fi Hip Hop Radio",
          url: "https://www.youtube.com/embed/rUxyKA_-grg?autoplay=1&mute=0",
          artist: "YouTube Stream",
          isYouTube: true
        }
      ]
    },
    youtubeLofi: {
      name: "Lo-fi Study Session",
      description: "Perfect for study sessions",
      tracks: [
        {
          title: "Lo-fi Study Session Radio",
          url: "https://www.youtube.com/embed/lTRiuFIWV54?autoplay=1&mute=0",
          artist: "YouTube Stream",
          isYouTube: true
        }
      ]
    },
    rain: {
      name: "Night Lo-fi",
      description: "Late night lo-fi vibes",
      tracks: [
        { 
          title: "Night Lo-fi Radio", 
          url: "https://www.youtube.com/embed/7NOSDKb0HlU?autoplay=1&mute=0",
          artist: "YouTube Stream",
          isYouTube: true
        }
      ]
    },
    whitenoise: {
      name: "Lo-fi Rain",
      description: "Lo-fi with rain sounds",
      tracks: [
        { 
          title: "Lo-fi Rain Radio", 
          url: "https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1&mute=0",
          artist: "YouTube Stream",
          isYouTube: true
        }
      ]
    },
    nature: {
      name: "Lo-fi Coffee Shop",
      description: "Coffee shop lo-fi ambience",
      tracks: [
        { 
          title: "Lo-fi Coffee Shop Radio", 
          url: "https://www.youtube.com/embed/1qYz7rfgLWE?autoplay=1&mute=0",
          artist: "YouTube Stream",
          isYouTube: true
        }
      ]
    },
    custom: {
      name: "Custom YouTube",
      description: "Paste any YouTube link",
      tracks: []
    },
    none: {
      name: "No Music",
      description: "Silent study mode",
      tracks: []
    }
  };

  // Fallback URLs that actually work
  const fallbackUrls = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  ];

  const currentPlaylistData = playlists[currentPlaylist];

  // Initialize audio context on first user interaction
  const initializeAudio = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      // Create audio context for better browser compatibility
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const context = new AudioContext();
          setAudioContext(context);
        }
      } catch (err) {
        console.log("AudioContext not supported");
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
    // For YouTube embeds, we need to update the iframe src with new volume
    if (currentPlaylistData?.tracks[currentTrack]?.isYouTube) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const currentSrc = iframe.src;
        const newSrc = currentSrc.replace(/[?&]volume=[^&]*/, '') + 
          (currentSrc.includes('?') ? '&' : '?') + `volume=${volume/100}`;
        iframe.src = newSrc;
      }
    }
  }, [volume, currentTrack, currentPlaylistData]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    // For YouTube embeds, update mute state
    if (currentPlaylistData?.tracks[currentTrack]?.isYouTube) {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        const currentSrc = iframe.src;
        const newSrc = currentSrc.replace(/[?&]mute=[^&]*/, '') + 
          (currentSrc.includes('?') ? '&' : '?') + `mute=${isMuted ? 1 : 0}`;
        iframe.src = newSrc;
      }
    }
  }, [isMuted, currentTrack, currentPlaylistData]);

  useEffect(() => {
    // Auto-play next track when current track ends
    const handleEnded = () => {
      if (currentPlaylistData && currentTrack < currentPlaylistData.tracks.length - 1) {
        setCurrentTrack(currentTrack + 1);
      } else if (currentPlaylistData && currentPlaylistData.tracks.length > 0) {
        // Loop back to first track
        setCurrentTrack(0);
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
      return () => audioRef.current?.removeEventListener('ended', handleEnded);
    }
  }, [currentTrack, currentPlaylistData]);

  const togglePlay = async () => {
    initializeAudio();
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          // Resume audio context if suspended
          if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
          }
          
          await audioRef.current.play();
          setIsPlaying(true);
          setError("");
        } catch (err) {
          console.error("Audio play error:", err);
          setError("Click the play button again to start music");
          setIsPlaying(false);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setError(""); // Clear any previous errors
    }
  };

  const handleError = () => {
    console.error("Audio loading error");
    setError("Failed to load audio. Try a different track or use YouTube option.");
  };

  const handleSeek = (e) => {
    const time = e.target.value;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextTrack = () => {
    if (currentPlaylistData && currentTrack < currentPlaylistData.tracks.length - 1) {
      setCurrentTrack(currentTrack + 1);
    }
  };

  const prevTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  const handleYoutubeUrlChange = (url) => {
    setYoutubeUrl(url);
    setError("");
  };

  const getYoutubeEmbedUrl = (url) => {
    // Extract video ID from various YouTube URL formats
    const videoId = extractYoutubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&volume=${volume/100}`;
    }
    return url;
  };

  const extractYoutubeVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
      /youtu\.be\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const playCustomYoutube = () => {
    if (youtubeUrl && extractYoutubeVideoId(youtubeUrl)) {
      setError("");
    } else {
      setError("Please enter a valid YouTube URL");
    }
  };

  const handlePlaylistChange = (newPlaylist) => {
    if (onPlaylistChange) {
      onPlaylistChange(newPlaylist);
    }
    setCurrentTrack(0);
    setIsPlaying(false);
    setError("");
  };

  if (!currentPlaylist || currentPlaylist === "none") {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Music className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Music Player</h3>
        </div>
        <p className="text-gray-400 text-sm mb-3">No music playing</p>
        
        {/* Playlist Selection */}
        <div className="space-y-2">
          <p className="text-white text-sm font-medium">Choose a playlist:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(playlists).filter(([key]) => key !== 'none').map(([key, playlist]) => (
              <button
                key={key}
                onClick={() => handlePlaylistChange(key)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{playlist.name}</p>
                    <p className="text-gray-400 text-xs">{playlist.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">{currentPlaylistData.name}</h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* YouTube URL Input (Host Only) */}
      {isHost && currentPlaylist === "custom" && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4 text-red-400" />
            <span className="text-white font-medium text-sm">Custom YouTube Video</span>
          </div>
          <div className="space-y-2">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => handleYoutubeUrlChange(e.target.value)}
              placeholder="Paste YouTube video URL here..."
              className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {youtubeUrl && (
              <button
                onClick={playCustomYoutube}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                <Play size={14} />
                Play Video
              </button>
            )}
          </div>
        </div>
      )}

      {/* Audio Player */}
      {currentPlaylist !== "custom" && currentPlaylistData.tracks.length > 0 && (
        <>
          {/* YouTube Embed for YouTube tracks */}
          {currentPlaylistData.tracks[currentTrack]?.isYouTube ? (
            <div className="mb-4">
              <iframe
                src={currentPlaylistData.tracks[currentTrack]?.url}
                width="100%"
                height="200"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          ) : (
            <>
              <audio
                ref={audioRef}
                src={currentPlaylistData.tracks[currentTrack]?.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                preload="metadata"
                crossOrigin="anonymous"
              />

              {/* Browser Audio Help */}
              {!hasUserInteracted && (
                <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <p className="text-blue-300 text-sm">
                      Click the play button to enable audio playback
                    </p>
                  </div>
                </div>
              )}

              {/* Current Track Info */}
              <div className="mb-4">
                <p className="text-white font-medium">
                  {currentPlaylistData.tracks[currentTrack]?.title || "No track"}
                </p>
                <p className="text-gray-400 text-sm">
                  {currentPlaylistData.tracks[currentTrack]?.artist} • Track {currentTrack + 1} of {currentPlaylistData.tracks.length}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 text-xs">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-gray-400 text-xs">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={prevTrack}
                  disabled={currentTrack === 0}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>
                
                <button
                  onClick={nextTrack}
                  disabled={currentTrack >= currentPlaylistData.tracks.length - 1}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMuteToggle(!isMuted)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-gray-400 text-xs w-8">{volume}%</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Custom YouTube Video Player */}
      {currentPlaylist === "custom" && youtubeUrl && (
        <div className="mb-4">
          <iframe
            src={getYoutubeEmbedUrl(youtubeUrl)}
            width="100%"
            height="200"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      )}

      {/* Playlist Selection */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-white text-sm font-medium mb-2">Switch playlist:</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(playlists).filter(([key]) => key !== currentPlaylist).map(([key, playlist]) => (
            <button
              key={key}
              onClick={() => handlePlaylistChange(key)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-white text-sm font-medium">{playlist.name}</p>
                  <p className="text-gray-400 text-xs">{playlist.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
} 