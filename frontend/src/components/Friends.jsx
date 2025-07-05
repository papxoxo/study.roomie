import { useState, useEffect } from "react";
import { Users, UserPlus, UserMinus, MessageCircle, Circle, MoreVertical, Shield, ShieldOff } from "lucide-react";

export default function Friends({ currentUser, onInviteFriend }) {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from backend
      const mockFriends = [
        {
          id: "1",
          username: "alice_study",
          name: "Alice Johnson",
          avatar: "A",
          isOnline: true,
          currentActivity: "focusing",
          lastSeen: new Date(),
          status: "active"
        },
        {
          id: "2",
          username: "bob_coder",
          name: "Bob Smith",
          avatar: "B",
          isOnline: false,
          currentActivity: "idle",
          lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: "active"
        },
        {
          id: "3",
          username: "charlie_learner",
          name: "Charlie Brown",
          avatar: "C",
          isOnline: true,
          currentActivity: "break",
          lastSeen: new Date(),
          status: "blocked"
        },
        {
          id: "4",
          username: "diana_reader",
          name: "Diana Wilson",
          avatar: "D",
          isOnline: true,
          currentActivity: "focusing",
          lastSeen: new Date(),
          status: "active"
        }
      ];
      
      setFriends(mockFriends);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFriend = async (username) => {
    try {
      // In real app, send request to backend
      const newFriend = {
        id: Date.now().toString(),
        username: username,
        name: username,
        avatar: username.charAt(0).toUpperCase(),
        isOnline: false,
        currentActivity: "idle",
        lastSeen: new Date(),
        status: "pending"
      };
      
      setFriends(prev => [...prev, newFriend]);
      setNewFriendUsername("");
      setShowAddFriend(false);
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      // In real app, send request to backend
      setFriends(prev => prev.filter(friend => friend.id !== friendId));
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const blockFriend = async (friendId) => {
    try {
      // In real app, send request to backend
      setFriends(prev => prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, status: friend.status === "blocked" ? "active" : "blocked" }
          : friend
      ));
    } catch (error) {
      console.error('Failed to block friend:', error);
    }
  };

  const inviteToRoom = (friend) => {
    if (onInviteFriend) {
      onInviteFriend(friend);
    }
  };

  const getActivityColor = (activity) => {
    switch (activity) {
      case "focusing": return "text-green-400";
      case "break": return "text-yellow-400";
      case "idle": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  const getActivityText = (activity) => {
    switch (activity) {
      case "focusing": return "Focusing";
      case "break": return "On Break";
      case "idle": return "Idle";
      default: return "Unknown";
    }
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const diff = now - lastSeen;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Friends</h2>
          <p className="text-gray-400">Manage your study buddies</p>
        </div>
        <button
          onClick={() => setShowAddFriend(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </div>

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Add Friend</h3>
            <input
              type="text"
              value={newFriendUsername}
              onChange={(e) => setNewFriendUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => addFriend(newFriendUsername)}
                disabled={!newFriendUsername.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddFriend(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search friends..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? "No friends found matching your search." : "No friends yet. Add some study buddies!"}
            </p>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className={`bg-gray-800 rounded-lg p-4 border-l-4 transition-all ${
                friend.status === "blocked" 
                  ? "border-red-500 opacity-60" 
                  : friend.isOnline 
                    ? "border-green-500" 
                    : "border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {friend.avatar}
                    </div>
                    <Circle 
                      className={`w-3 h-3 absolute -bottom-1 -right-1 ${
                        friend.isOnline ? 'text-green-400 fill-green-400' : 'text-gray-500'
                      }`} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{friend.name}</p>
                      {friend.status === "blocked" && (
                        <ShieldOff className="w-4 h-4 text-red-400" />
                      )}
                      {friend.status === "pending" && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">@{friend.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getActivityColor(friend.currentActivity)}`}>
                        {getActivityText(friend.currentActivity)}
                      </span>
                      {!friend.isOnline && (
                        <span className="text-gray-500 text-xs">
                          • {formatLastSeen(friend.lastSeen)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {friend.isOnline && friend.status === "active" && (
                    <button
                      onClick={() => inviteToRoom(friend)}
                      className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                      title="Invite to room"
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                    </button>
                  )}
                  
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-gray-700 rounded-lg shadow-lg border border-gray-600 min-w-[120px] z-10">
                      <button
                        onClick={() => blockFriend(friend.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        {friend.status === "blocked" ? (
                          <>
                            <Shield className="w-4 h-4" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <ShieldOff className="w-4 h-4" />
                            Block
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-600 transition-colors flex items-center gap-2 text-red-400"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {friends.filter(f => f.isOnline).length}
          </p>
          <p className="text-gray-400 text-sm">Online</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {friends.filter(f => f.status === "active").length}
          </p>
          <p className="text-gray-400 text-sm">Active</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">
            {friends.filter(f => f.status === "blocked").length}
          </p>
          <p className="text-gray-400 text-sm">Blocked</p>
        </div>
      </div>
    </div>
  );
} 