// backend/src/socket.js
import { Session } from "./models/Session.js";
import { v4 as uuidv4 } from 'uuid';

const ROOMS = new Map(); // roomId → state object
const USERS = new Map(); // socketId → user object

function buildState(overrides = {}) {
  return {
    mode: "idle",      // idle | focus | break | paused
    secondsLeft: 1500, // Default to 25:00 (1500 seconds)
    focus: 25,
    breakTime: 5,
    intervalId: null,
    isLocked: false,   // Room lock status
    ...overrides,
  };
}

function buildUser(socketId, username, roomId, isHost = false) {
  return {
    id: socketId,
    name: username,
    roomId: roomId,
    isHost: isHost,
    isOnline: true,
    joinedAt: new Date(),
  };
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    /* ---------- JOIN ROOM ---------- */
    socket.on("join_room", ({ roomId, username, isHost }) => {
      socket.roomId = roomId;
      socket.username = username;
      socket.isHost = isHost;
      socket.join(roomId);

      // Create room if it doesn't exist
      if (!ROOMS.has(roomId)) {
        ROOMS.set(roomId, buildState());
      }

      // Check if room is locked
      const room = ROOMS.get(roomId);
      if (room.isLocked && !isHost) {
        socket.emit("room_locked");
        return;
      }

      // Create user object
      const user = buildUser(socket.id, username, roomId, isHost);
      USERS.set(socket.id, user);

      // Add user to room
      if (!room.users) room.users = [];
      room.users.push(user);

      // Emit current room state to newcomer
      const roomState = ROOMS.get(roomId);
      socket.emit("timer_update", {
        mode: roomState.mode,
        secondsLeft: roomState.secondsLeft,
        focus: roomState.focus,
        breakTime: roomState.breakTime
      });

      // Notify others about new user
      socket.to(roomId).emit("user_joined", user);

      // Send updated users list to all
      io.to(roomId).emit("users_update", room.users);

      // Send focus streak data
      const streakData = {
        streak: room.focusStreak || 0,
        energy: room.energy || 0,
        totalSessions: room.totalSessions || 0
      };
      socket.emit("focus_streak_update", streakData);
    });

    /* ---------- LEAVE ROOM ---------- */
    socket.on("leave_room", ({ roomId, username }) => {
      if (socket.roomId) {
        const room = ROOMS.get(socket.roomId);
        if (room && room.users) {
          room.users = room.users.filter(user => user.id !== socket.id);
          io.to(socket.roomId).emit("users_update", room.users);
        }
        
        socket.to(socket.roomId).emit("user_left", socket.id);
        socket.leave(socket.roomId);
      }
      
      USERS.delete(socket.id);
    });

    /* ---------- START TIMER ---------- */
    socket.on("start_timer", ({ roomId, focus = 25, breakTime = 5 }) => {
      let state = ROOMS.get(roomId) || buildState();
      clearInterval(state.intervalId);

      state = buildState({ mode: "focus", focus, breakTime, secondsLeft: focus * 60 });
      state.intervalId = setInterval(() => tick(io, roomId), 1_000);

      ROOMS.set(roomId, state);
      io.to(roomId).emit("timer_update", {
        mode: state.mode,
        secondsLeft: state.secondsLeft,
        focus: state.focus,
        breakTime: state.breakTime
      });
    });

    /* ---------- PAUSE TIMER ---------- */
    socket.on("pause_timer", () => {
      const state = ROOMS.get(socket.roomId);
      if (!state || state.mode === "idle") return;

      clearInterval(state.intervalId);
      state.mode = "paused";
      io.to(socket.roomId).emit("timer_update", {
        mode: state.mode,
        secondsLeft: state.secondsLeft,
        focus: state.focus,
        breakTime: state.breakTime
      });
    });

    /* ---------- RESUME TIMER ---------- */
    socket.on("resume_timer", () => {
      const state = ROOMS.get(socket.roomId);
      if (!state || state.mode !== "paused") return;

      state.mode = "focus";
      state.intervalId = setInterval(() => tick(io, socket.roomId), 1_000);
      io.to(socket.roomId).emit("timer_update", {
        mode: state.mode,
        secondsLeft: state.secondsLeft,
        focus: state.focus,
        breakTime: state.breakTime
      });
    });

    /* ---------- STOP TIMER ---------- */
    socket.on("stop_timer", () => {
      const state = ROOMS.get(socket.roomId);
      if (!state) return;

      clearInterval(state.intervalId);
      // Reset to original focus time (25:00 = 1500 seconds)
      const resetState = buildState({ 
        mode: "idle", 
        secondsLeft: 1500, 
        focus: 25 
      });
      ROOMS.set(socket.roomId, resetState);
      io.to(socket.roomId).emit("timer_update", {
        mode: resetState.mode,
        secondsLeft: resetState.secondsLeft,
        focus: resetState.focus,
        breakTime: resetState.breakTime
      });
    });

    /* ---------- ROOM LOCK ---------- */
    socket.on("toggle_room_lock", () => {
      const state = ROOMS.get(socket.roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user || !user.isHost) return;
      
      state.isLocked = !state.isLocked;
      io.to(socket.roomId).emit("room_lock_update", { isLocked: state.isLocked });
    });

    /* ---------- CHAT ---------- */
    socket.on("chat_msg", ({ message }) => {
      const state = ROOMS.get(socket.roomId);
      if (state?.mode !== "break") return;              // block during focus/idle
      
      const user = USERS.get(socket.id);
      if (!user) return;
      
      io.to(socket.roomId).emit("chat_msg", { 
        userId: socket.id, 
        username: user.name,
        message,
        timestamp: new Date()
      });
    });

    /* ---------- MUSIC CONTROL ---------- */
    socket.on("music_change", ({ roomId, playlist, youtubeUrl }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user || !user.isHost) return;
      
      state.currentPlaylist = playlist;
      if (youtubeUrl) {
        state.youtubeUrl = youtubeUrl;
      }
      io.to(roomId).emit("music_change", { playlist, youtubeUrl });
    });

    /* ---------- AMBIENT THEME ---------- */
    socket.on("ambient_change", ({ roomId, theme }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user || !user.isHost) return;
      
      state.ambientTheme = theme;
      io.to(roomId).emit("ambient_change", { theme });
    });

    /* ---------- FILE UPLOAD ---------- */
    socket.on("file_upload", ({ roomId, fileData }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Add file metadata
      const fileWithMetadata = {
        ...fileData,
        uploadedBy: user.name,
        uploadedAt: new Date(),
        uploadedById: socket.id
      };
      
      if (!state.sharedFiles) state.sharedFiles = [];
      
      // Check if file already exists to prevent duplicates
      const existingFile = state.sharedFiles.find(f => f.id === fileData.id);
      if (existingFile) return;
      
      state.sharedFiles.push(fileWithMetadata);
      
      io.to(roomId).emit("file_upload", fileWithMetadata);
    });

    /* ---------- FILE DELETE ---------- */
    socket.on("file_delete", ({ roomId, fileId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      if (state.sharedFiles) {
        const fileIndex = state.sharedFiles.findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
          const file = state.sharedFiles[fileIndex];
          // Only allow deletion by uploader or host
          if (file.uploadedById === socket.id || user.isHost) {
            state.sharedFiles.splice(fileIndex, 1);
            io.to(roomId).emit("file_delete", fileId);
          }
        }
      }
    });

    /* ---------- COLLABORATIVE NOTES ---------- */
    socket.on("notes_update", ({ roomId, notes, userId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      state.collaborativeNotes = notes;
      state.lastNotesUpdate = new Date();
      state.lastNotesUpdateBy = socket.id;
      
      io.to(roomId).emit("notes_update", { 
        notes, 
        userId: socket.id,
        username: user.name,
        timestamp: new Date()
      });
    });

    /* ---------- EXCALIDRAW WHITEBOARD ---------- */
    socket.on("excalidraw_update", ({ roomId, elements, appState }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast Excalidraw updates to all users in the room
      socket.to(roomId).emit("excalidraw_update", { 
        elements, 
        appState,
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("excalidraw_collaborator_join", ({ roomId, userId, username }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast collaborator join to all users in the room
      socket.to(roomId).emit("excalidraw_collaborator_join", {
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("excalidraw_collaborator_leave", ({ roomId, userId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast collaborator leave to all users in the room
      socket.to(roomId).emit("excalidraw_collaborator_leave", {
        userId: socket.id,
        username: user.name
      });
    });

    /* ---------- WHITEBOARD DRAWING ---------- */
    socket.on("whiteboard_draw", ({ roomId, x, y, type, color, size, text }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast drawing to all users in the room
      socket.to(roomId).emit("whiteboard_draw", { 
        x, y, type, color, size, text,
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("whiteboard_clear", ({ roomId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast clear to all users in the room
      socket.to(roomId).emit("whiteboard_clear", {
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("whiteboard_undo", ({ roomId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast undo to all users in the room
      socket.to(roomId).emit("whiteboard_undo", {
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("whiteboard_redo", ({ roomId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast redo to all users in the room
      socket.to(roomId).emit("whiteboard_redo", {
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("whiteboard_collaborator_join", ({ roomId, userId, username }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast collaborator join to all users in the room
      socket.to(roomId).emit("whiteboard_collaborator_join", {
        userId: socket.id,
        username: user.name
      });
    });

    socket.on("whiteboard_collaborator_leave", ({ roomId, userId }) => {
      const state = ROOMS.get(roomId);
      const user = USERS.get(socket.id);
      
      if (!state || !user) return;
      
      // Broadcast collaborator leave to all users in the room
      socket.to(roomId).emit("whiteboard_collaborator_leave", {
        userId: socket.id,
        username: user.name
      });
    });

    /* ---------- DISCONNECT ---------- */
    socket.on("disconnect", () => {
      if (socket.roomId) {
        const room = ROOMS.get(socket.roomId);
        if (room && room.users) {
          room.users = room.users.filter(user => user.id !== socket.id);
          io.to(socket.roomId).emit("users_update", room.users);
        }
        
        socket.to(socket.roomId).emit("user_left", socket.id);
      }
      
      USERS.delete(socket.id);
    });
  });
}

/* ---------- INTERNAL TICK ---------- */
async function tick(io, roomId) {
  const state = ROOMS.get(roomId);
  if (!state) return;

  /* 1️⃣  Decrement only while time remains */
  if (state.secondsLeft > 0) {
    state.secondsLeft -= 1;
  }

  /* 2️⃣  When time hits zero, toggle mode & reset counter */
  if (state.secondsLeft === 0) {
    state.mode = state.mode === "focus" ? "break" : "focus";
    state.secondsLeft =
      (state.mode === "focus" ? state.focus : state.breakTime) * 60;

    // Persist completed focus block and update streaks
    if (state.mode === "break") {
      await Session.recordFocusForRoom(roomId, state.focus);
      
      // Update focus streak
      state.focusStreak = (state.focusStreak || 0) + 1;
      state.totalSessions = (state.totalSessions || 0) + 1;
      state.energy = Math.min((state.energy || 0) + 10, 100);
      
      // Emit streak update
      io.to(roomId).emit("focus_streak_update", {
        streak: state.focusStreak,
        energy: state.energy,
        totalSessions: state.totalSessions
      });
    }
  }

  /* 3️⃣  Broadcast fresh state */
  io.to(roomId).emit("timer_update", { 
    mode: state.mode,
    secondsLeft: state.secondsLeft,
    focus: state.focus,
    breakTime: state.breakTime
  });
}

