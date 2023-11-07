// @ts-check

/**
 * Mensajes de una aplicación de chat
 * Cada mensaje consta de un ID, un texto,
 * y el nombre de su autor
 * @typedef {object} Message
 * @property {number} id
 * @property {string} message 
 * @property {string} author
 */


class MessageModel {
    constructor() {
        this.lastId = 0;
    }

    /**
     * Crea un mensaje
     * @param {{ author: string, message: string }} message 
     */
    createMessage({ message, author }) {
        return { 
            id: this.lastId++,
            message,
            author
        };
    }
}

export const messageModel = new MessageModel();