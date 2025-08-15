import express from "express";
import http from "http";
import { Server } from "socket.io";
import { messageHandler } from "./sockets/message";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: process.env.FRONTEND_URL,
  },
});
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Hello World from TypeScript!" });
});

function delay(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(process.env.FRONTEND_URL);

const nameToSocketIdMapping = new Map();
const socketIdToNameMapping = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (data) => {
    const { name, roomId } = data;
    console.log("new user joined", name, socket.id);
    nameToSocketIdMapping.set(name, socket.id);
    socketIdToNameMapping.set(socket.id, name);

    socket.join(roomId);
    // socket.emit("joined-room", { roomId });
    io.to(roomId).emit("joined-room", { roomId, name });
  });

  socket.on("call-user", async (data) => {
    const { name, offer } = data;
    const socketId = nameToSocketIdMapping.get(name);
    const offerSenderName = socketIdToNameMapping.get(socket.id);
    console.log("calling :", name, socketId, "by", offerSenderName);
    // await delay(1000);
    io.to(socketId).emit("call-user", { offer, offerSenderName });
  });

  socket.on("call-user-negotiation", async (data) => {
    const { name, offer } = data;
    const socketId = nameToSocketIdMapping.get(name);
    const offerSenderName = socketIdToNameMapping.get(socket.id);
    console.log("calling :", name, socketId, "by", offerSenderName);
    // await delay(1000);
    io.to(socketId).emit("call-user-negotiation", { offer, offerSenderName });
  });

  socket.on("call-accepted", (data) => {
    const { answer, offerSenderName } = data;
    const socketId = nameToSocketIdMapping.get(offerSenderName);
    io.to(socketId).emit("call-accepted", { answer });
  });

  socket.on("start-btn-clicked", (data) => {
    const { remoteName } = data;
    console.log("remote btn clicked :", remoteName);
    const socketId = nameToSocketIdMapping.get(remoteName);
    io.to(socketId).emit("start-btn-clicked");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
