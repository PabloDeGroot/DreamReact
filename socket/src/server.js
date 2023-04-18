import { createServer } from "http"
import { Server } from "socket.io"
import * as csv from "csv"
let https = await import('node:http');
import * as fs from 'fs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
const httpServer = https.createServer(

)
const login = async (username, password) => {
    /*const getFileContents = async (filepath) => {
  const data = [];

  return new Promise(function(resolve, reject) {
    fs.createReadStream(filepath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => data.push(row))
      .on('end', () => {
        console.log(data);
        resolve(data);
      });
  });
} */
    let pass = crypto.createHash('md5').update(password).digest("hex")
    console.log("Pass encriptada")
    console.log(pass)
    let columns = {
        username: 'username',
        password: 'password',
        user_id: 'user_id'
    }
    
    let data = []
    let uuid = ""
    let success = false
    return new Promise(function (resolve, reject) {
        fs.createReadStream("users.csv")
            .pipe(csv.parse({ headers: true , columns: true}))
            .on('error', error => reject(error))
            .on('data', row => data.push(row))
            .on('end', () => {
                console.log("data")
                console.log(data)
                for (let i = 0; i < data.length; i++) {
                    if (data[i].username == username && data[i].password == pass) {
                        console.log("user found")
                        uuid = data[i].user_id
                        success = true
                        break;
                    }
                }
                console.log(uuid)
                resolve({uuid:uuid,username:username,success:success})
            });
    })
}
const register = (username, password) => {

    let columns = {
        username: 'username',
        password: 'password',
        user_id: 'user_id'
    }
    let data = []
    let pass = crypto.createHash('md5').update(password).digest("hex")
    data.push([username, pass ,uuidv4()])
    console.log(data)
    csv.stringify(data, { header: true, columns: columns }, (err, output) => {
        fs.appendFile("users.csv", output, (err) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log("user added")
            }
        })
    })

    
}

const io = new Server(httpServer, {
    //path: "/socket/"
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
var rooms = {}
io.on("connection", (socket) => {

    console.log("new connection");
    // send to new connection all other users
    // send to all other users new connection
    socket.on('hello', (data) => {
        socket.join(data.room)
        console.log("hello")
        console.log(data)
        socket.emit("userlist", Object.values(users));
        var users = rooms[data.room]
        if (users == undefined) {
            rooms[data.room] = {}
            users = rooms[data.room]
        }
        users[socket.id] = {
            username: data.username,
            id: data.id
        }
        console.log(users);
        socket.to(data.room).emit("welcome", users[socket.id])

    })
    socket.on("stop", (data) => {
        socket.to(data.room).emit("wakeUp", rooms[data.room][socket.id].id);
    })
    socket.on('disconnect', (data) => {
        console.log("disconnect");
        console.log(rooms[data.room][socket.id])
        if (users[socket.id] != undefined) {
            io.emit("goodbye", rooms[data.room][socket.id].id);
            delete rooms[data.room][socket.id];
            if (Object.keys(rooms[data.room]).length == 0) {
                delete rooms[data.room]
            }
        }
    })



    
    socket.on('login', async (data) => {

        var uuid = await login(data.username, data.password);
        console.log("test")
        console.log(uuid)
        if (uuid.success) {
            socket.emit("login", uuid);
        }
        else {
            socket.emit("login", { success: false });
        }

    })
    socket.on('register', (data) => {
        if (register(data.username, data.password)) {
            socket.emit("register", true);
        }else{
            socket.emit("register", false);
        }
});
});

httpServer.listen(2000);
console.log("starting server on port 2000")