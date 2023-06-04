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
import { ThemeProvider, createTheme, styled } from '@mui/material';
import { SnackbarProvider } from 'notistack';

const randomPrimaryColor = () => {
  const colors = [
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#98FF98',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#e91e63',
    '#9c27b0',
    '#ff4081',
    '#d500f9',


  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

//Create a valid SECONDARY color at random
const randomSecondaryColor = () => {
  const colors = [
    '#30999C',
    '#F2994A',
    '#9744A3',
    '#6ECFB9',
    '#a787ad',
    '#dcb761',
    '#CB6284',
    '#F2B705',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
const local = true;

var url = local ? "ws://localhost:2000" : "wss://duckhub.dev:2000"




const socket = io(url,{secure:true, reconnection: true, rejectUnauthorized : false})
const theme = createTheme({
  palette: {
    // create a palete with pastel colors
    primary: {
      main: randomPrimaryColor(),
    },
    secondary: {
      main: randomSecondaryColor(),
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },

  }
  ,


  gradients: {
    primary: {
      main: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    },
    secondary: {
      main: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    },
    warning: {
      main: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
    },
    info: {
      main: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    },
    success: {
      main: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
    },
    error: {
      main: 'linear-gradient(45deg, #F44336 30%, #E57373 90%)',
    },
  },
});



// add theme to stackbar


const Snackbar = styled(SnackbarProvider)`
&.SnackbarItem-variantSuccess {
    background: ${(p) => p.theme.gradients.success.main};
}
&.SnackbarItem-variantError {
    background: ${(p) => p.theme.gradients.error.main};
}
&.SnackbarItem-variantWarning {
    background: ${(p) => p.theme.gradients.warning.main};
}
&.SnackbarItem-variantInfo {
    background: ${(p) => p.theme.gradients.info.main};
}
`;








function App() {

  return (
    <ThemeProvider theme={theme}>
      <Snackbar
        Components
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}

      >
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
      </Snackbar >
    </ThemeProvider>
  );
}

export default App;
