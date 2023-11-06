import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { messageService } from "./service/message.service.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve(process.cwd(), "./public")));

io.on("connection", (socket) => {
  console.log("Se conectó un usuario.");
  console.log("Mensajes: ", messageService.findAll());
  socket.on("join", () => {
    io.emit("all messages", messageService.findAll());
  });

  socket.on("typing", (author) => {
    socket.broadcast.emit("typing", author);
  })

  socket.on("quit typing", (author) => {
    socket.broadcast.emit("quit typing", author);
  })

  socket.on("message", (data) => {
    const message = {
      author: data.author,
      message: data.message,
    };
    messageService.addMessage(message);
    socket.broadcast.emit("message", message);
  });
  socket.on("disconnect", () => {
    console.log("Un cliente se descnonectó.");
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
