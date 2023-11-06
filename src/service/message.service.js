class MessageService {
    constructor() {
        this.messages = [];
        this.lastId = 0;
    }

    /**
     * Crea un mensaje
     * @param {{ author: string, message: string }} message 
     */
    addMessage(message) {
        this.messages.push({ 
            id: this.lastId++,
            ...message
        });
    }

    /**
     * Encuentra un mensaje por ID
     * 
     * @param {number} id
     */
    findById(messageId) {
        return this.messages.find(msg => msg.id == messageId);
    }

    /**
     * Retorna todos los mensajes
     */
    findAll() {
        return this.messages;
    }
}

export const messageService = new MessageService();