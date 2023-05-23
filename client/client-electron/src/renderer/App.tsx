import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';

import './App.css';
import { useEffect, useState } from 'react';
import { ReactComponent as CursorIcon } from '../../assets/icons/cursor.svg'
import Peer from 'peerjs'; // usado para WebRTC
//socket.io-client
import io from "socket.io-client";



const local = true;
//const lib = koffi.load("user32.dll")



var url = local ? "ws://localhost:2000" : "wss://duckhub.dev:2000"

const socket = io(url, { secure: false, reconnection: true, rejectUnauthorized: false })

const username = "user";



export default function App() {



  const [users, setUsers] = useState([] as any);
  const [stream, setStream] = useState(null as any);

  const [peers, setPeers] = useState([] as any);

  console.log("App.tsx: App()");


  useEffect(() => {
    console.log("App.tsx: useEffect()");
    console.log(users);
  }, [users]);


  useEffect(() => {
    const peer = new Peer({
      debug: 1,

    });



    var callPeer = (peer: Peer, peerid: string, stream: MediaStream) => {
      var user = peer.connect(peerid, { metadata: { username: "electron" } });
      setPeers((peers: any) => [...peers, user]);
      var spectator = peer.call(peerid, stream, { metadata: { username: "electron" } });
      if (user.dataChannel) {
        user.dataChannel.onerror = (e: Event) => {
          console.log("Error datachannel");
          console.log(e);
          setPeers((peers: any) => peers.filter((p: any) => p.peer != peerid));
          spectator.close();

        };
      }
      user.on('close', () => {
        setPeers((peers: any) => peers.filter((p: any) => p.peer != peerid));
      });/*
      user.on('error', () => {
        setPeers((peers: any) => peers.filter((p: any) => p.peer != peerid));
      });
      if (user.dataChannel) {
        user.dataChannel.onerror = (e: Event) => {
          console.log("Error datachannel");
          console.log(e);
          setPeers((peers: any) => peers.filter((p: any) => p.peer != peerid));1
        };
      }


      spectator.on('close', () => {
        setPeers((peers: any) => peers.filter((p: any) => p.peer != peerid));
      });
      spectator.on('error', () => {
        spectator.close();
        console.log("error");
        setPeers((peers: any) => peers.filter((p: any) => p.peer != peerid));
      });*/


    }
    var handlePeerConnect = async (peer: Peer, stream: MediaStream) => {
      console.log("App.tsx: handlePeerConnect()");
      var room = await window.electron.screen.getRoom();
      var username = await window.electron.screen.getUsername();
      console.log("App.tsx: Room: " + room);
      console.log("App.tsx: Username: " + username);

      socket.emit("hello", { id: peer.id + "", username: username, room: room, client: "electron" });
      socket.on("userlist", (data: any) => {
        data.forEach((user: any) => {
          callPeer(peer, user.id, stream);
        });
      });
      socket.on("welcome", (data: any) => {
        callPeer(peer, data.id, stream);
      });
    }

    var handleSocket = (peer: any, stream: any) => {

      if (peer.open) {
        handlePeerConnect(peer, stream);
      } else {
        peer.on('open', function (id: any) {
          console.log('My peer ID is: ' + id);
          handlePeerConnect(peer, stream);

        });
      }
    }

    var handleStream = (stream: any, peer: any, socket: any) => {

      if (socket.connected) {
        handleSocket(peer, stream)
      } else {
        socket.on("connect", () => {
          handleSocket(peer, stream)
        })
      }
    }




    function handleError(e: any) {
      console.log(e)
    }




    window.electron.ipcRenderer.on("SET_SOURCE", async (data: any) => {
      console.log("App.tsx: SET_SOURCE");
      try {
        var streamaux = await (navigator.mediaDevices as any).getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: data.id,

            }
          }
        })

        handleStream(streamaux, peer, socket)
        setStream(streamaux)
      }
      catch (e) {
        handleError(e)
      }
    })

  }, []);


  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'black',
      }}
    >
      {peers.map((user: any, i: number) => {
        return <User key={i} peer={user} />
      })}
    </div>
  );
}
function User(props: any) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState("black");
  const [username, setUsername] = useState("aa");

  useEffect(() => {
    props.peer.off('open').on('open', async function () {

      props.peer.off('welcome').on('welcome', (data: any) => {
        //setUsername(data.username)
        setColor(data.color)
      });
      props.peer.off('data').on('data', (data: any) => {
        if (data.type == "mousemove") {

          setMousePosition({ x: data.pos.x * screen.width, y: data.pos.y * screen.height })

        } else if (data.type == "mousedown") {

        } else if (data.type == "mouseup") {
          window.electron.screen.clickMouse(data.pos.x * screen.width, data.pos.y * screen.height, data.mtype)
        } else if (data.type == "keydown") {
          window.electron.screen.keyDown(data.key)
        } else if (data.type == "keyup") {
          window.electron.screen.keyUp(data.key)
        } else if (data.type == "scroll") {
          window.electron.screen.scroll(data.scroll, data.pos.x * screen.width, data.pos.y * screen.height)
        } else if (data.type == "welcome") {
          setUsername(data.username.username)
          setColor(data.color)
        }
        console.log('Received', data);
      });


    });
  }, []);

  return <div id="followMouse"
    style={{
      position: 'absolute',
      display: 'flex',
      top: mousePosition.y - 10,
      left: mousePosition.x - 15,
      color: 'black',

    }}
  >

    <CursorIcon

      style={{
        width: '25px',
        height: '25spx',

      }}
      fill={color}
    />

    <p
      style={{
        fontSize: '20px',
        color: 'black',
        fontWeight: 'bold',
        fontFamily: 'Arial',
        backgroundColor: '#ffffff50',
        paddingInline: '5px',
        borderRadius: '5px',
      }}
    > {username}</p>


  </div>
}
