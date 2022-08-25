import logo from './logo.svg';
import './App.css';
import { Peer } from "peerjs";

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
function App() {

  return (
    <>
      <Router>

        <Routes>
          <Route exact path="/" element={

              <Login />
          } />
          <Route exact path="/Room" element={<Room />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
