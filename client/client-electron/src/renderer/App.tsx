import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';

import './App.css';
import { useEffect, useState } from 'react';
import { ReactComponent as CursorIcon } from '../../assets/icons/cursor.svg'
import Peer from 'peerjs'; // usado para WebRTC
//socket.io-client
import io from "socket.io-client";

const local = true;

var url = local ? "ws://localhost:2000" : "wss://duckhub.dev:2000"




const socket = io(url,{secure:false, reconnection: true, rejectUnauthorized : false})




const username = "user";
const room = "room";

function handlePeerConnect(peer: Peer, stream: any) {
  console.log("App.tsx: handlePeerConnect()");
  socket.emit("hello", { id: peer.id + "", username: username, room: room, client: "electron" });
  socket.on("userlist", (data: any) => {

    data.forEach((user: any) => {
      var e = peer.connect(user.id, { metadata: { username: user.username } });
      e.on('open', async function () {
        console.log(stream);


        var spectator = peer.call(user.id, stream, { metadata: { username: user.username } });
        spectator.on('stream', function (remoteStream: any) {
          // Show stream in some video/canvas element.
          console.log("App.tsx: spectator.on('stream')");

        }
        );
      });
    });
  });
}


function handleStream(stream: any,peer:any,socket:any) {
  console.log("App.tsx: handleStream()")
  socket.on("connect", () => {
    console.log("App.tsx: socket.on('connect')");
    if (peer.open) {
      handlePeerConnect(peer, stream);
    } else {
      peer.on('open', function (id:any ) {
        console.log('My peer ID is: ' + id);
        handlePeerConnect(peer, stream);

      });
    }
  });
}

function handleError(e: any) {
  console.log(e)
}

export default function App() {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stream, setStream] = useState(null as any);


  console.log("App.tsx: App()");


  useEffect(() => {
    const peer = new Peer({
      debug:1,

    });



    window.electron.ipcRenderer.on("SET_SOURCE", async (data: any) => {
      console.log("App.tsx: SET_SOURCE");
      try {
        var streamaux = await (navigator.mediaDevices as any).getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: data.id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720
            }
          }
        })

        handleStream(streamaux,peer,socket)
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

      <div id="followMouse"
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
            width: '30px',
            height: '30px',

          }}
          fill="cyan"

        />

        <p
          style={{
            fontSize: '20px',
            color: 'black',
            fontWeight: 'bold',
            fontFamily: 'Arial',
            backgroundColor: 'white',
            borderRadius: '5px',
          }}
        > User</p>


      </div></div >
  );
}
