import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { registerSocketHandlers } from "./socket.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (_, res) => res.send("study.roomie backend up ✨"));

const server = http.createServer(app);
const io = new Server(server, {cors: {origin: "*"}});

// Set up PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/peerjs",
});

app.use("/peerjs", peerServer);

// middleware to attach io to req
app.use((req, _res, next) => { req.io = io; next(); });

io.use((socket, next) => {
  // For now, allow connections without token for easier testing
  // const token = socket.handshake.auth?.token;
  // if (!token) return next(new Error("No token"));
  // socket.userId = token; 
  next();
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  connectDB();
  console.log(`Backend listening on ${PORT}`);
  console.log(`PeerJS server running on ${PORT}/peerjs`);
});
