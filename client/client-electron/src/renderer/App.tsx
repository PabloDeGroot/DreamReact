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

const socket = io(url, { secure: false, reconnection: true, rejectUnauthorized: false })

const username = "user";
const room = "room";



export default function App() {



  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stream, setStream] = useState(null as any);


  console.log("App.tsx: App()");


  useEffect(() => {
    const peer = new Peer({
      debug: 1,

    });



    var callPeer = (peer: Peer, peerid: string, stream: MediaStream) => {
      console.log("App.tsx: Welcome");
      var e = peer.connect(peerid, { metadata: { username: "electron" } });
      e.on('open', async function () {


        e.on('data', (data: any) => {
          if (data.type == "mousemove") {



            setMousePosition({ x: data.pos.x * screen.width, y: data.pos.y * screen.height })
          }else if (data.type=="mousedown"){

          }else if (data.type=="mouseup"){

          }
          console.log('Received', screen);
        });


        var spectator = peer.call(peerid, stream, { metadata: { username: "electron" } });
      });
    }
    var handlePeerConnect = (peer: Peer, stream: MediaStream) => {
      console.log("App.tsx: handlePeerConnect()");
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
