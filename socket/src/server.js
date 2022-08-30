import { createServer } from "http"
import { Server } from "socket.io"

const httpServer = createServer();
const io = new Server(httpServer, {
    //path: "/socket/"
});
var users = {}
io.on("connection", (socket) => {
    console.log("new connection");
    // send to new connection all other users
    // send to all other users new connection
    socket.on('hello', (data) => {
        console.log(data);
        socket.emit("userlist", Object.values(users));
        users[socket.id] = {
            username: data.username,
            id: data.id
        }
        socket.broadcast.emit("welcome", users[socket.id])

    })
    socket.on('disconnect', () => {
        delete users[socket.id];
        console.log(users);
    })
});


httpServer.listen(2000);
console.log("starting server on port 2000")