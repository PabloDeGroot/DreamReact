import { createServer } from "http"
import { Server } from "socket.io"
import * as csv from "csv"
//node:http
import * as https from 'https';
import * as fs from 'fs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

var cert = fs.readFileSync('/etc/letsencrypt/live/duckhub.dev/fullchain.pem');
var key = fs.readFileSync('/etc/letsencrypt/live/duckhub.dev/privkey.pem');


const httpServer = https.createServer(
    {
        key: key,
        cert: cert
    }
);

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

const userExists = (username) =>{
    let columns = {
        username: 'username',
        password: 'password',
        user_id: 'user_id'
    }
    let data = []
    return new Promise(function (resolve, reject) {
        fs.createReadStream("users.csv")
            .pipe(csv.parse({ headers: true , columns: true}))
            .on('error', error => reject(error))
            .on('data', row => data.push(row))
            .on('end', () => {
                console.log("data")
                console.log(data)
                for (let i = 0; i < data.length; i++) {
                    if (data[i].username == username) {
                        console.log("user found")
                        resolve(true)
                        break;
                    }
                }
                resolve(false)
            });
    })
    
}

const register = async (username, password) => {

    if (await userExists(username)) {
        return false
    }


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
var globalUsers = {}
io.on("connection", (socket) => {

    console.log("new connection");
    // send to new connection all other users
    // send to all other users new connection
    socket.on('hello', (data) => {
        console.log("hello")
        console.log(data)
        let users = rooms[data.room]
        if (users == undefined) {
            rooms[data.room] = {}
            users = rooms[data.room]
        }

        rooms[data.room][socket.id] = {
            username: data.username,
            id: data.id
        }
        globalUsers[socket.id] = {
            id: data.id,
            room: data.room
        }

        //console.log(users);
        socket.to(data.room).emit("welcome", rooms[data.room][socket.id])
        socket.join(data.room)
        socket.emit("userlist", Object.values(users).filter((user) => user.id != data.id));

    })
    socket.on("stop", (data) => {
        socket.to(data.room).emit("wakeUp", rooms[data.room][socket.id].id);
    })
    socket.on('disconnect', () => {
        console.log("disconnect");
            let user = globalUsers[socket.id]    
            console.log(rooms)

        if (user != undefined) {
            socket.to(user.room).emit("goodbye", user.id);
            delete rooms[user.room][socket.id];
            if (Object.keys(rooms[user.room]).length == 0) {
                delete rooms[user.room]
            }
            delete globalUsers[socket.id]
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

