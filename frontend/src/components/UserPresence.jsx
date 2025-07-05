import { Users, Circle } from "lucide-react";

export default function UserPresence({ users = [] }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Room Participants</h3>
        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
          {users.length}
        </span>
      </div>

      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-gray-400 text-sm">No participants yet</p>
        ) : (
          users.map((user, index) => (
            <div key={index} className="flex items-center gap-3 p-2 bg-gray-700 rounded-lg">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Circle 
                  className={`w-3 h-3 absolute -bottom-1 -right-1 ${
                    user.isOnline ? 'text-green-400 fill-green-400' : 'text-gray-500'
                  }`} 
                />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-xs">
                  {user.isHost ? 'Host' : 'Participant'}
                </p>
              </div>
              {user.isHost && (
                <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                  Host
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
} 