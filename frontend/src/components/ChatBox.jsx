import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Lock, Unlock } from "lucide-react";
import { socket } from "../socket";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ChatBox({ roomId, isBreakMode = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [socketId, setSocketId] = useState(null);
  const [avatars, setAvatars] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setSocketId(socket.id);
    const onConnect = () => setSocketId(socket.id);
    socket.on("connect", onConnect);
    return () => socket.off("connect", onConnect);
  }, []);

  useEffect(() => {
    const onMsg = (data) => {
      setMessages(m => [
        ...m,
        {
          ...data,
          isOwn: data.userId === socket.id
        }
      ]);
    };
    socket.on("chat_msg", onMsg);
    return () => socket.off("chat_msg", onMsg);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch avatars for all userIds in messages
  useEffect(() => {
    async function fetchAvatars() {
      const userIds = Array.from(new Set(messages.map(m => m.userId)));
      const newAvatars = { ...avatars };
      await Promise.all(userIds.map(async (uid) => {
        if (uid && !newAvatars[uid]) {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            newAvatars[uid] = snap.data().avatar;
          }
        }
      }));
      setAvatars(newAvatars);
    }
    if (messages.length > 0) fetchAvatars();
    // eslint-disable-next-line
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isBreakMode) {
      // Optimistically add the message to the chat
      setMessages(m => [
        ...m,
        {
          userId: socket.id,
          username: socket.username || "You",
          message: newMessage,
          isOwn: true,
          timestamp: new Date()
        }
      ]);
      socket.emit("chat_msg", { roomId, message: newMessage });
      setNewMessage("");
    }
  };

  const handleFocusAttempt = () => {
    if (!isBreakMode) {
      alert("💬 Chat is only available during break mode! Focus on your studies for now.");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          {isBreakMode ? (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <Unlock size={14} />
              <span>Unlocked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Lock size={14} />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {!isBreakMode ? (
          <div className="text-center text-gray-400 py-8">
            <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-2">Chat is locked during focus mode</p>
            <p className="text-sm">Chat will unlock during break time</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <img
                src={avatars[message.userId] || "https://api.dicebear.com/7.x/bottts/svg?seed=default"}
                alt="avatar"
                className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-gray-700"
              />
              <div
                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.isOwn
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <div className="text-xs opacity-75 mb-1">{message.username || message.userId || "Anonymous"}</div>
                <div>{message.message}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isBreakMode ? "Type a message..." : "Chat locked during focus mode"}
          disabled={!isBreakMode}
          onFocus={handleFocusAttempt}
          className={`flex-1 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            isBreakMode 
              ? "bg-gray-700" 
              : "bg-gray-800 cursor-not-allowed opacity-50"
          }`}
        />
        <button
          type="submit"
          disabled={!isBreakMode}
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            isBreakMode
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-600 cursor-not-allowed opacity-50"
          }`}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
