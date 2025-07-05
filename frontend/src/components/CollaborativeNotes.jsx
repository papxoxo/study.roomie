import { useState, useEffect, useRef } from "react";
import { FileText, Users, Save, Trash2, Download, Upload } from "lucide-react";

export default function CollaborativeNotes({ notes = "", onNotesChange, collaborators = [] }) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isEditing, setIsEditing] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    setCharacterCount(localNotes.length);
  }, [localNotes]);

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setLocalNotes(newNotes);
    onNotesChange(newNotes);
  };

  const handleSave = () => {
    setLastSaved(new Date());
    // In a real app, this would save to the backend
    console.log("Notes saved:", localNotes);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all notes?")) {
      setLocalNotes("");
      onNotesChange("");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([localNotes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-roomie-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          setLocalNotes(content);
          onNotesChange(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "Never";
    const now = new Date();
    const diff = now - lastSaved;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSaved.toLocaleDateString();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Collaborative Notes</h3>
        </div>
        
        {/* Collaborators */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {collaborators.length} active
          </span>
        </div>
      </div>

      {/* Notes Editor */}
      <div className="bg-gray-700 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Shared Notes</span>
            {isEditing && (
              <span className="text-green-400 text-sm">● Live editing</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpload}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
              title="Upload Notes"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
              title="Download Notes"
            >
              <Download size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
              title="Save Notes"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              title="Clear All"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={localNotes}
          onChange={handleNotesChange}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder="Start typing your shared notes here... Everyone in the room can see and edit these notes in real-time!"
          className="w-full h-48 bg-gray-600 border border-gray-500 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />

        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>{characterCount} characters</span>
            <span>•</span>
            <span>{localNotes.split('\n').length} lines</span>
            <span>•</span>
            <span>Real-time collaboration</span>
          </div>
          <span>Last saved: {formatLastSaved()}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            const template = `# Study Session Notes

## Today's Goals
- 

## Key Points
- 

## Questions
- 

## Next Steps
- 

---
Session: ${new Date().toLocaleDateString()}
`;
            setLocalNotes(template);
            onNotesChange(template);
          }}
          className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
        >
          <div className="text-white font-medium text-sm">📝 Study Template</div>
          <div className="text-gray-400 text-xs">Use a structured template</div>
        </button>

        <button
          onClick={() => {
            const timestamp = new Date().toLocaleTimeString();
            const newNote = `\n\n--- ${timestamp} ---\n`;
            setLocalNotes(localNotes + newNote);
            onNotesChange(localNotes + newNote);
          }}
          className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-left"
        >
          <div className="text-white font-medium text-sm">⏰ Add Timestamp</div>
          <div className="text-gray-400 text-xs">Mark important moments</div>
        </button>
      </div>

      {/* Collaborators List */}
      {collaborators.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h4 className="text-white font-medium mb-2">Active Collaborators</h4>
          <div className="flex flex-wrap gap-2">
            {collaborators.map((user, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 