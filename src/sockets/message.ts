import { Server, Socket } from "socket.io";

export const messageHandler = (io: Server) => (data: any) => {
  console.log("Message from client:", data);
  io.emit("message", data); // broadcast to all clients
};
