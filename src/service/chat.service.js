// @ts-check
import { Server } from "socket.io";

import { roomModel } from "../models/rooms.model.js";

/**
 * Servicio que maneja salas de chats como
 * conjuntos de mensajes.
 */
class ChatService {
  /**
   * @param {typeof import('../models/rooms.model').roomModel} roomModel
   * @param {import('socket.io').Server} io
   */
  constructor(roomModel, io) {
    this.roomModel = roomModel;
    this.server = io;
  }

  /**
   * Comienza la escucha de conexiones
   */
  async run() {
    this.server.on("connection", this.getConnectionHandler());
  }

  /**
   * Crea una sala de chat con el ID y el nombre especificados
   *
   * @param {number} roomId
   * @param {string} name
   */
  createRoom(roomId, name) {
    this.roomModel.create({
      id: roomId,
      name,
    });
  }

  getConnectionHandler() {
    /** @param {import('socket.io').Socket} socket */
    return (socket) => {
      // Enviamos las salas disponibles **solo**
      // al socket que emitió el evento
      socket.on('get available rooms', () => {
        const rooms = this.roomModel.rooms;
        socket.emit('available rooms', rooms);
      })


      // Evento de unirse a una sala de chat
      socket.on("join", (roomId = 0) => {
        // Si no se pasa ningún ID de sala,
        // se une a la sala de ID 0
        const room = this.roomModel.findById(roomId);
        if (roomId && !room) return;
        socket.join(roomId);
        this.server.emit(
          "all messages",
          this.roomModel.getAllMessagesFromRoom(roomId)
        );
      });


      // Evento de dejar una sala de chat
      socket.on("leave", (roomId = 0) => {
        socket.leave(roomId);
      })

      // Eventos relacionados a la escritura de mensajes
      socket.on("typing", (author, roomId = 0) => {
        socket.broadcast.to(roomId).emit("typing", author);
      });

      socket.on("quit typing", (author, roomId = 0) => {
        socket.broadcast.to(roomId).emit("quit typing", author, roomId);
      });

      // Evento de mensajes
      socket.on("message", (data, roomId = 0) => {
        const message = {
          author: data.author,
          message: data.message,
        };
        this.roomModel.sendToRoom(roomId, message);
        socket.broadcast.emit("message", message);
      });



      // Evento de disconexión
      socket.on("disconnect", (roomId) => {
        socket.leave(roomId);
      });
    };
  }
}

/**
 * Retorna un nuevo servicio de chat con el servidor
 * HTTP especificado.
 *
 * @param {import('http').Server} httpServer
 * @returns {ChatService}
 */

export function chatServerFrom(httpServer) {
  const io = new Server(httpServer);
  return new ChatService(roomModel, io);
}
