import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Video, Clock, MessageCircle, Zap, BarChart3, FileText, Music, Lock, Target } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex gap-4">
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
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            How study.roomie Works
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your study sessions with our comprehensive collaborative platform designed for productivity and focus
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <Users className="w-12 h-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Study Buddy System</h3>
            <p className="text-gray-400 mb-4">
              Connect with friends, see who's online, and invite them to your study sessions. Build your study community.
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Add and manage study buddies</li>
              <li>• Send room invitations</li>
              <li>• View online/offline status</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <Video className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Video Calling</h3>
            <p className="text-gray-400 mb-4">
              Crystal clear video calls with your study partners. Stay connected and motivated together.
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• High-quality video calls</li>
              <li>• Screen sharing capabilities</li>
              <li>• Multiple participants support</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <Clock className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Shared Timer</h3>
            <p className="text-gray-400 mb-4">
              Synchronized Pomodoro timer for focused study sessions. Everyone stays on the same schedule.
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Customizable study intervals</li>
              <li>• Break time management</li>
              <li>• Session synchronization</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <MessageCircle className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Real-time Chat</h3>
            <p className="text-gray-400 mb-4">
              Chat with your study partners during breaks or ask questions without interrupting the session.
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Real-time messaging</li>
              <li>• User avatars and names</li>
              <li>• Chat history tracking</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <FileText className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Shared Notes</h3>
            <p className="text-gray-400 mb-4">
              Upload and share documents, PDFs, and notes with your study group. Collaborative learning made easy.
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• File upload and sharing</li>
              <li>• User attribution tracking</li>
              <li>• Cloud storage integration</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <Zap className="w-12 h-12 text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Focus Streak</h3>
            <p className="text-gray-400 mb-4">
              Track your productivity and build momentum with daily study streaks and progress analytics.
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Daily streak tracking</li>
              <li>• Progress visualization</li>
              <li>• Achievement milestones</li>
            </ul>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-8 border border-gray-700 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Account</h3>
              <p className="text-gray-400">
                Sign up with your email and create your profile to get started
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Create or Join Room</h3>
              <p className="text-gray-400">
                Start a new study session or join an existing one with friends
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Study Together</h3>
              <p className="text-gray-400">
                Use all the features to maximize your productivity and focus
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Study Sessions?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of students who are already studying smarter with study.roomie
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/signin"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 