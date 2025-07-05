import { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs";
import Webcam from "react-webcam";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Monitor, MonitorOff, PenTool } from "lucide-react";
import Whiteboard from "./Whiteboard";

export default function VideoCall({ roomId, username, socket }) {
  const [peers, setPeers] = useState({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  
  const peerRef = useRef();
  const localVideoRef = useRef();
  const remoteVideosRef = useRef({});
  const localStreamRef = useRef();
  const screenStreamRef = useRef();

  useEffect(() => {
    if (!roomId || !username) return;

    // Initialize PeerJS
    peerRef.current = new Peer(`${username}-${roomId}-${Date.now()}`, {
      host: "localhost",
      port: 8080,
      path: "/peerjs",
    });

    peerRef.current.on("open", (id) => {
      console.log("My peer ID:", id);
      setIsConnected(true);
    });

    peerRef.current.on("call", handleIncomingCall);
    peerRef.current.on("disconnected", () => {
      setIsConnected(false);
    });

    // Get local video stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing media devices:", err);
      });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId, username]);

  const handleIncomingCall = (call) => {
    call.answer(localVideoRef.current?.srcObject);
    
    call.on("stream", (remoteStream) => {
      const videoElement = document.createElement("video");
      videoElement.srcObject = remoteStream;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.className = "w-full h-full object-cover rounded-lg";
      
      const container = document.createElement("div");
      container.className = "relative bg-gray-800 rounded-lg overflow-hidden";
      container.appendChild(videoElement);
      
      // Add peer name
      const nameLabel = document.createElement("div");
      nameLabel.className = "absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm";
      nameLabel.textContent = call.peer.split("-")[0];
      container.appendChild(nameLabel);
      
      remoteVideosRef.current[call.peer] = container;
      setPeers(prev => ({ ...prev, [call.peer]: container }));
    });
  };

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        screenStreamRef.current = screenStream;
        
        // Replace video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Update all peer connections with new stream
        Object.keys(peers).forEach(peerId => {
          const peer = peerRef.current.connections[peerId]?.[0];
          if (peer) {
            const videoTrack = screenStream.getVideoTracks()[0];
            const sender = peer.peerConnection.getSenders().find(s => 
              s.track?.kind === 'video'
            );
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          }
        });
        
        setIsScreenSharing(true);
        
        // Handle screen share stop
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
        
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    // Restore camera stream
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    
    // Update all peer connections with camera stream
    Object.keys(peers).forEach(peerId => {
      const peer = peerRef.current.connections[peerId]?.[0];
      if (peer && localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peer.peerConnection.getSenders().find(s => 
          s.track?.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }
    });
    
    setIsScreenSharing(false);
  };

  const toggleWhiteboard = () => {
    setIsWhiteboardOpen(!isWhiteboardOpen);
  };

  const leaveCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Video Call</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {username} (You)
          </div>
        </div>

        {/* Remote Videos */}
        {Object.values(peers).map((peerElement, index) => (
          <div key={index} className="aspect-video">
            {peerElement}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioEnabled 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioEnabled ? "Mute" : "Unmute"}
        >
          {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-colors ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
        >
          {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
        </button>

        <button
          onClick={toggleWhiteboard}
          className={`p-3 rounded-full transition-colors ${
            isWhiteboardOpen 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title={isWhiteboardOpen ? "Close whiteboard" : "Open whiteboard"}
        >
          <PenTool size={20} />
        </button>

        <button
          onClick={leaveCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Leave call"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      {/* Whiteboard Modal */}
      <Whiteboard
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        socket={socket}
        roomId={roomId}
        isHost={true}
      />
    </div>
  );
} 