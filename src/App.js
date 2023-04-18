import logo from './logo.svg';
import './App.css';
import { Peer } from "peerjs";
import { io } from 'socket.io-client'; //usado para administrar usuarios

import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Routes,

} from "react-router-dom";

//import Login
import Login from './components/Login';

//import room
import Room from './components/Room';


const socket = io(":2000")

function App() {

  return (
    <>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      <Router>

        <Routes>
          <Route exact path="/" element={
            <Login socket={socket} />
          } />
          <Route path="/Room/:room"
            element={<Room socket={socket} />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
