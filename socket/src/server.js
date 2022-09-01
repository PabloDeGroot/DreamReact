import { createServer } from "http"
import { Server } from "socket.io"
var https = require("https");
fs = require("fs");
const httpServer = https.createServer(
    {
        key: fs.readFileSync("/etc/ssl/certs/dream.key"),
        cert: fs.readFileSync("/etc/ssl/certs/dream.crt"),
    }
)


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
    socket.on("stop", () => {
        socket.broadcast.emit("wakeUp", users[socket.id].id);
    })
    socket.on('disconnect', () => {
        console.log(users[socket.id])
        if (users[socket.id]) {
            io.emit("goodbye", users[socket.id].id);
            delete users[socket.id];
        }
    })
});


httpServer.listen(2000);
console.log("starting server on port 2000")