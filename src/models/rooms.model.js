// @ts-check

import { messageModel } from './message.model.js';

/**
 * Salas de chat de la aplicación
 * Cada sala tiene un identificador, un nombre
 * y consta de un conjunto de mensajes enviados.
 * @typedef {object} Room
 * @property {number} id 
 * @property {string} name
 * @property {import('./message.model').Message[]} messages
 */

export class RoomModel {
    /**
     * 
     * @param {Room[]} rooms 
     * @param {typeof import('./message.model').messageModel} messageModel
     */
    constructor(
        rooms = [],
        messageModel
    ) {
        /** @type {Room[]} */
        this.rooms = rooms;
        this.messageModel = messageModel;
    }

    /**
     * Crea una sala de chat
     * 
     * @param {{ id: number, name: string }} param0 
     */
    create({ id, name }) {
        this.rooms.push({
            id,
            name,
            messages: []
        });
    }

    /**
     * Envía un mensaje a una sala
     * 
     * @param {number} roomId
     * @param {{ author: string, message: string }} message
     */
    sendToRoom(roomId, message) {
        const room = this.rooms.find(r => r.id == roomId);
        if (!room) return false;
        room.messages.push(
            this.messageModel.createMessage({
                ...message
            })
        );
        return true;
    }

    /**
     * Encuentra una sala por ID
     * 
     * @param {number} roomId
     */
    findById(roomId) {
        return this.rooms.find(r => r.id == roomId) ?? null;
    }

    /**
     * Retorna todos los mensajes de una sala
     * 
     * @param {number} roomId
     */
    getAllMessagesFromRoom(roomId) {
        return this.rooms.find(r => roomId == r.id)?.messages;
    }
}

export const roomModel = new RoomModel(
    [],
    messageModel
);