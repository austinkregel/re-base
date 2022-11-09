module.exports = class Bus {
    constructor() {
        this.sockets = {};
    }

    addSocket(id, socket) {
        this.sockets[id] = socket;
    }

    deleteSocket(id) {
        delete this.sockets[id];
    }

    emit(channel, message) {
        Object.keys(this.sockets)
            .forEach((socketKey) => {
                const socket = this.sockets[socketKey];
                socket.emit(channel, message)
            })
    }

    listen(channel, closure) {
        Object.keys(this.sockets)
            .forEach((socketKey) => {
                const socket = this.sockets[socketKey];

                socket.on(channel, closure);
            })
    }

    emitExceptFor(channel, message, socketIds = []) {
        Object.keys(this.sockets)
            .forEach((socketKey) => {
                if (socketIds.includes(socketKey)) {
                    return;
                }

                const socket = this.sockets[socketKey];

                socket.emit(channel, message)
            })
    }
}