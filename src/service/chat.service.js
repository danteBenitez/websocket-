// @ts-check
import { Server } from 'socket.io';

import { roomModel } from '../models/rooms.model.js';

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
  run() {
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
      
      // Evento de unirse a una sala de chat
      socket.on("join", (roomId) => {
        const room = this.roomModel.findById(roomId);
        if (!room) return;
        socket.join(roomId);
        this.server.emit(
          "all messages",
          this.roomModel.getAllMessagesFromRoom(roomId)
        );
      });

      // Eventos relacionados a la escritura de mensajes
      socket.on("typing", (author) => {
        socket.broadcast.emit("typing", author);
      });

      socket.on("quit typing", (author) => {
        socket.broadcast.emit("quit typing", author);
      });

      // Evento de mensajes
      socket.on("message", (data, roomId) => {
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