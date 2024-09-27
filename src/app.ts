import express from 'express';
import { createServer } from 'node:http';
import {Server} from 'socket.io';
import cors from 'cors';
import {randomUUID} from "node:crypto";

// Определяем интерфейс для пользователя
export type UserType = {
    id: string
    name: string
}

// Определяем интерфейс для сообщения
export type MessageType = {
    message: string
    id: string
    user: UserType
}

const app = express();

// Используйте cors
// app.use(cors({
//     origin: 'http://localhost:5173', // Укажите разрешенный источник
//     credentials: true // Если нужно отправлять куки
// }));

const server = createServer(app);

const socket = new Server(server,{
    cors: {
        origin: "http://localhost:5173"
    }
});

const messages:MessageType[] = [
    {message:'HI',id:'4124we42',user:{id:'45we4457ee0',name:'Polina'}},
    {message:'WOOW!!!',id:'4235we42',user:{id:'452ewe4227ee0',name:'Kiryll'}},
    {message:'Samyrai',id:'46wew342',user:{id:'45we411723ee0',name:'Veronika'}},
    {message:'Go camping',id:'46wew45342',user:{id:'45we411723ee0',name:'Veronika'}},
]

const usersState = new Map()

app.get('/', (req, res) => {
    res.send('<h1>Hello Polina!!</h1>');
});

socket.on("connection", (socketChannel) => {

    usersState.set(socketChannel,{id: new Date().getTime().toString(),name:'Anonymous'})

    socketChannel.on('disconnect',()=>{
        usersState.delete(socketChannel)
    })
    socketChannel.on('user-send-name',(name:string) => {
        if(typeof name !== 'string') {
            return
        }
    const user = usersState.get(socketChannel)
    user.name = name
    })
    socketChannel.on('client-typed',() => {
     // socketChannel.broadcast.emit('user-typing',usersState.get(socketChannel)) // send all users but yourself
     socket.emit('user-typing',usersState.get(socketChannel))
    })

    socketChannel.on("client-message-sent", (message:string,successFn) => {
        if(typeof message !== 'string' || message.length > 20){
            successFn('Message must be shorter than 20 symbols')
            return
        }
        const user = usersState.get(socketChannel)

        let messageItem = {message:message,id:randomUUID(),
            user:{id:user.id,name:user.name}}

        messages.push(messageItem)
        socket.emit('new-message-sent',messageItem)
        successFn(null)
    });
    socketChannel.emit('init-messages-published',messages)

    console.log('Polina connected');
});

// const PORT = process.env.PORT || 3009

server.listen(3009, () => {
    console.log('server running at http://localhost:3009');
});