"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const node_crypto_1 = require("node:crypto");
const app = (0, express_1.default)();
// Используйте cors
// app.use(cors({
//     origin: 'http://localhost:5173', // Укажите разрешенный источник
//     credentials: true // Если нужно отправлять куки
// }));
const server = (0, node_http_1.createServer)(app);
const socket = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:5173", 'https://chat-socket-io-front-ten.vercel.app/']
    }
});
const messages = [
    { message: 'HI', id: '4124we42', user: { id: '45we4457ee0', name: 'Polina' } },
    { message: 'WOOW!!!', id: '4235we42', user: { id: '452ewe4227ee0', name: 'Kiryll' } },
    { message: 'Samyrai', id: '46wew342', user: { id: '45we411723ee0', name: 'Veronika' } },
    { message: 'Go camping', id: '46wew45342', user: { id: '45we411723ee0', name: 'Veronika' } },
];
const usersState = new Map();
app.get('/', (req, res) => {
    res.send('<h1>Hello Polina!!</h1>');
});
socket.on("connection", (socketChannel) => {
    usersState.set(socketChannel, { id: new Date().getTime().toString(), name: 'Anonymous' });
    socketChannel.on('disconnect', () => {
        usersState.delete(socketChannel);
    });
    socketChannel.on('user-send-name', (name) => {
        if (typeof name !== 'string') {
            return;
        }
        const user = usersState.get(socketChannel);
        user.name = name;
    });
    socketChannel.on('client-typed', () => {
        // socketChannel.broadcast.emit('user-typing',usersState.get(socketChannel)) // send all users but yourself
        socket.emit('user-typing', usersState.get(socketChannel));
    });
    socketChannel.on("client-message-sent", (message, successFn) => {
        if (typeof message !== 'string' || message.length > 20) {
            successFn('Message must be shorter than 20 symbols');
            return;
        }
        const user = usersState.get(socketChannel);
        let messageItem = { message: message, id: (0, node_crypto_1.randomUUID)(),
            user: { id: user.id, name: user.name } };
        messages.push(messageItem);
        socket.emit('new-message-sent', messageItem);
        successFn(null);
    });
    socketChannel.emit('init-messages-published', messages);
    console.log('Polina connected');
});
const PORT = process.env.PORT || 3009;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map