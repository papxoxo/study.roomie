import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { updateProfile, updateEmail } from "firebase/auth";

const AVATAR_PRESETS = [
  // You can add more preset avatar URLs or SVGs here
  "https://api.dicebear.com/7.x/bottts/svg?seed=study1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=study2",
  "https://api.dicebear.com/7.x/bottts/svg?seed=study3",
  "https://api.dicebear.com/7.x/bottts/svg?seed=study4",
];

export default function ProfileForm() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatar, setCustomAvatar] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    setName(currentUser.displayName || "");
    setEmail(currentUser.email || "");
    // Load Firestore profile
    getDoc(doc(db, "users", currentUser.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBio(data.bio || "");
        setAvatar(data.avatar || AVATAR_PRESETS[0]);
      }
      setLoading(false);
    });
  }, [currentUser]);

  const handleAvatarChange = (url) => {
    setAvatar(url);
    setCustomAvatar(null);
  };

  const handleCustomAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      setCustomAvatar(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // Update Firebase Auth
      await updateProfile(currentUser, { displayName: name, photoURL: avatar });
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }
      // Update Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        bio,
        avatar,
        name,
        email,
      }, { merge: true });
      setSuccess("Profile updated!");
      setEditMode(false);
    } catch (err) {
      setError("Failed to update profile. " + err.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-400">Loading profile...</div>;

  if (!editMode) {
    return (
      <div className="max-w-lg mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">My Profile</h2>
        {success && <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">{success}</div>}
        <div className="flex flex-col items-center gap-4">
          <img
            src={avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <div className="text-white font-semibold text-lg">{name}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <div className="text-white font-medium">{email}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
          <div className="text-gray-300">{bio || <span className="italic text-gray-500">No bio</span>}</div>
        </div>
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Edit Profile</h2>
      {error && <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">{error}</div>}
      {success && <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-300">{success}</div>}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <img
            src={avatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover bg-gray-700"
          />
          <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleCustomAvatar} />
            <span className="text-xs">+</span>
          </label>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {AVATAR_PRESETS.map((url, i) => (
            <button
              type="button"
              key={i}
              className={`rounded-full border-2 ${avatar === url ? "border-indigo-500" : "border-transparent"}`}
              onClick={() => handleAvatarChange(url)}
            >
              <img src={url} alt="Preset avatar" className="w-10 h-10 rounded-full" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
} 