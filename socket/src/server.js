import { createServer } from "http"
import { Server } from "socket.io"
import * as csv from "csv"
//node:http
import * as https from 'https';
import * as fs from 'fs';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const local = false;

var httpServer;


if (!local) {
    var cert = fs.readFileSync('/etc/letsencrypt/live/duckhub.dev/fullchain.pem');
    var key = fs.readFileSync('/etc/letsencrypt/live/duckhub.dev/privkey.pem');


    httpServer = https.createServer(
        {
            key: key,
            cert: cert
        }
    );
}
else {
    httpServer = createServer();
}

const login = async (username, password) => {
    let pass = crypto.createHash('md5').update(password).digest("hex")
    let columns = {
        username: 'username',
        password: 'password',
        user_id: 'user_id'
    }

    let data = []
    let uuid = ""
    let success = false
    return new Promise(function (resolve, reject) {

        fs.readFile("users.csv", (err, data) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            else {
                console.log(data)
                let lines = data.toString().trim().split("\n")
                console.log(lines)
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].split(",")
                    console.log(line)
                    if (line[0] == username && line[1] == pass) {
                        console.log("user found")
                        uuid = line[2]
                        success = true
                        break;
                    }
                }
                resolve({ uuid: uuid, username: username, success: success })
            }
        })
        

            /*fs.createReadStream("users.csv")
            .pipe(csv.parse({ columns:true }))
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
                resolve({ uuid: uuid, username: username, success: success })
            });*/
    })

}

const userExists = (username) => {



//Pablo4,b1e889533f311ce384fbe51963b0f861,e5d8efe0-cb1d-4b8f-ac87-7f4148089c5f
//AAAA,25d55ad283aa400af464c76d713c07ad,4ba5825d-5d50-4466-b70f-c04d9c669b5a

    let data = []
    return new Promise(function (resolve, reject) {
        fs.readFile("users.csv", (err, data) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            else {
                console.log(data)
                let lines = data.toString().trim().split("\n")
                console.log(lines)
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i].split(",")
                    console.log(line)
                    if (line[0] == username) {
                        console.log("user found")
                        resolve(true)
                        break;
                    }
                }
                resolve(false)
            }
        })
    })

        /*fs.createReadStream("users.csv")
            .pipe(csv.parse({ columns: true }))
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
    })*/

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

    fs.appendFileSync("users.csv", username + "," + pass + "," + uuidv4() + "\n")
    //data.push([username, pass, uuidv4()])
    //console.log(data)
    /*csv.stringify(data, { header: true, columns: columns, delimiter: ',', final: true
     }, (err, output) => {
        if (output == "") {
            return false
        }
        console.log(output)
        fs.appendFile("users.csv", output, (err) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log("user added")
            }
        })
    })*/


}

const io = new Server(httpServer, {
    //path: "/socket/"}
    //alow cors
    cors: {
        origin: "*", //or "https://duckhub.dev"
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
        globalUsers[socket.id] = {
            id: data.id,
            room: data.room
        }
        if (data.client != "electron") {
            rooms[data.room][socket.id] = {
                username: data.username,
                id: data.id
            }

            socket.to(data.room).emit("welcome", rooms[data.room][socket.id])
            socket.emit("userlist", Object.values(users).filter((user) => user.id != data.id));

        } else {

            console.log("electron")
      
            

            socket.emit("userlist", users);
            //console.log(data)
            //socket.to(data.room).emit("welcome", {username: data.username, id: data.id})
            console.log("electron")
        }
        console.log(users)

        //console.log(users);

        socket.join(data.room)
        //socket.emit("userlist", Object.values(users).filter((user) => user.id != data.id));

    })
    socket.on("stop", (data) => {
        if(rooms[data.room] == undefined && rooms[data.room][socket.id] == undefined){
        socket.to(data.room).emit("wakeUp", rooms[data.room][socket.id].id);}
    })
    socket.on('disconnect', () => {
        console.log("disconnect");
        let user = globalUsers[socket.id]
        console.log(user)
        console.log(rooms)

        if (user != undefined) {
            socket.to(user.room).emit("goodbye", user.id);
            if (rooms[user.room] != undefined) {
                delete rooms[user.room][socket.id];
                if (Object.keys(rooms[user.room]).length == 0) {
                    delete rooms[user.room]
                }
            }
            delete globalUsers[socket.id]
        }
    })
    socket.on("message", (data) => {
        console.log("msg")
        console.log(data)
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
        } else {
            socket.emit("register", false);
        }
    });
});


httpServer.listen(2000);
console.log("starting server on port 2000")

