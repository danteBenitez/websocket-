import express from "express";
import http from "http";
import path from "path";
import { chatServerFrom } from "./service/chat.service.js";

const app = express();

const server = http.createServer(app);
const chatServer = chatServerFrom(server);

chatServer.createRoom(0, "Sala por defecto");
chatServer.createRoom(1, "Sala 1");
chatServer.createRoom(2, "Sala 2");
chatServer.run();

app.use(express.static(path.resolve(process.cwd(), "./public")));


server.listen(3000, () => {
  console.log("listening on *:3000");
});
