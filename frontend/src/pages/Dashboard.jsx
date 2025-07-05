import { useState } from "react";
import { BarChart3, Users, Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudyStats from "../components/StudyStats";
import Friends from "../components/Friends";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("stats");
  const navigate = useNavigate();

  const tabs = [
    { id: "stats", name: "My Stats", icon: BarChart3 },
    { id: "friends", name: "My Friends", icon: Users },
    { id: "sessions", name: "Upcoming Sessions", icon: Settings }
  ];

  const handleInviteFriend = (friend) => {
    // In a real app, this would send an invitation
    console.log("Inviting friend:", friend);
    alert(`Invitation sent to ${friend.name}!`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm">Track your progress and manage friends</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === "stats" && (
            <StudyStats userId="current-user" />
          )}
          
          {activeTab === "friends" && (
            <Friends 
              currentUser="current-user" 
              onInviteFriend={handleInviteFriend}
            />
          )}
          
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Upcoming Sessions</h2>
                <p className="text-gray-400">Schedule and manage your study sessions</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Upcoming Sessions</h3>
                  <p className="text-gray-400 mb-4">
                    You don't have any scheduled study sessions yet.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
                  >
                    Create a Session
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 