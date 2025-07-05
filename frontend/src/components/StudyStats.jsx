import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Clock, Target, Trophy, TrendingUp, Activity } from "lucide-react";

export default function StudyStats({ userId }) {
  const [stats, setStats] = useState({
    totalPomodoros: 0,
    totalFocusHours: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyHours: 0,
    monthlyHours: 0,
    dailyBreakdown: [],
    focusDistribution: [],
    badges: []
  });
  const [timeframe, setTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [userId, timeframe]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your backend
      // For now, we'll use mock data
      const mockStats = {
        totalPomodoros: 127,
        totalFocusHours: 53.2,
        currentStreak: 7,
        longestStreak: 14,
        weeklyHours: 12.5,
        monthlyHours: 48.3,
        dailyBreakdown: [
          { day: 'Mon', hours: 2.5, pomodoros: 5 },
          { day: 'Tue', hours: 3.2, pomodoros: 6 },
          { day: 'Wed', hours: 1.8, pomodoros: 4 },
          { day: 'Thu', hours: 2.1, pomodoros: 4 },
          { day: 'Fri', hours: 1.9, pomodoros: 4 },
          { day: 'Sat', hours: 0.8, pomodoros: 2 },
          { day: 'Sun', hours: 0.2, pomodoros: 1 }
        ],
        focusDistribution: [
          { name: 'Study', value: 45, color: '#6366f1' },
          { name: 'Work', value: 30, color: '#10b981' },
          { name: 'Reading', value: 15, color: '#f59e0b' },
          { name: 'Other', value: 10, color: '#ef4444' }
        ],
        badges: [
          { name: 'Early Bird', icon: '🌅', description: 'Studied before 8 AM', earned: true },
          { name: 'Night Owl', icon: '🦉', description: 'Studied after 10 PM', earned: true },
          { name: 'Weekend Warrior', icon: '⚡', description: 'Studied 5+ hours on weekend', earned: true },
          { name: 'Consistency King', icon: '👑', description: '7-day streak', earned: true },
          { name: 'Marathon Runner', icon: '🏃', description: '10+ hour study session', earned: false },
          { name: 'Social Butterfly', icon: '🦋', description: 'Studied with 10+ different people', earned: false }
        ]
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

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
          <h2 className="text-2xl font-bold text-white">Study Statistics</h2>
          <p className="text-gray-400">Track your progress and achievements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeframe === 'week' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeframe === 'month' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Pomodoros</p>
              <p className="text-2xl font-bold text-white">{stats.totalPomodoros}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Focus Hours</p>
              <p className="text-2xl font-bold text-white">{formatTime(stats.totalFocusHours)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-white">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Best Streak</p>
              <p className="text-2xl font-bold text-white">{stats.longestStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Breakdown */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Focus Distribution */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Focus Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.focusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.focusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#f3f4f6' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4">
            {stats.focusDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.badges.map((badge, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-2 transition-all ${
                badge.earned 
                  ? 'bg-gray-700 border-indigo-500' 
                  : 'bg-gray-900 border-gray-600 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className={`font-medium ${badge.earned ? 'text-white' : 'text-gray-400'}`}>
                    {badge.name}
                  </p>
                  <p className="text-sm text-gray-400">{badge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly/Monthly Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {timeframe === 'week' ? 'This Week' : 'This Month'} Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-400">
              {timeframe === 'week' ? formatTime(stats.weeklyHours) : formatTime(stats.monthlyHours)}
            </p>
            <p className="text-gray-400">Total Focus Time</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {timeframe === 'week' ? '5' : '22'}
            </p>
            <p className="text-gray-400">Study Sessions</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {timeframe === 'week' ? '2.5' : '4.2'}
            </p>
            <p className="text-gray-400">Avg Hours/Day</p>
          </div>
        </div>
      </div>
    </div>
  );
} 