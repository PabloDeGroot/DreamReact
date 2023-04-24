import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';

import './App.css';
import { useEffect, useState } from 'react';
import { ReactComponent as CursorIcon } from '../../assets/icons/cursor.svg'


export default function App() {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stream, setStream] = useState(null as any);
  useEffect(() => {
    window.electron.ipcRenderer.on('sendStream', (arg) => {
      setStream(arg);

      // eslint-disable-next-line no-console
      // arg as { x: number; y: number };
      //var t = arg as { x: number; y: number };
      //if (t.x != mousePosition.x || t.y != mousePosition.y) {
      //  setMousePosition(arg as { x: number; y: number });
        //console.log(mousePosition);

        console.log(arg)
      //}
    });
  }, []);




  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
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
