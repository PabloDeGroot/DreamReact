import { Fab, Icon, IconButton, Slide, Zoom, CircularProgress, Snackbar, Alert, Paper, Typography, Collapse } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect } from "react";
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';
import Peer from 'peerjs'; // usado para WebRTC
import useLocalStorage from '../Hooks/MyHooks';

import { useSnackbar } from 'notistack';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client'; //usado para administrar usuarios
import $ from 'jquery';

const peer = new Peer({

});


function Room(props) {
    let navigate = useNavigate();
    const { room } = useParams()


    const socket = props.socket;
    const [dreams, setDreams] = React.useState({});
    const [isOptionsExpanded, expandOptions] = React.useState(true);
    const [isMicOn, toggleMic] = React.useState(true);
    const [isScreenCapOn, toggleScreenCap] = React.useState(false);
    const [isAudioOn, toggleAudio] = React.useState(true);
    const [stream, setLocalStream] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const { state } = useLocation();
    const [user, setUser] = useLocalStorage('user', null);
    const [userid, setUserID] = React.useState(null);
    const [value, setValue] = React.useState(0); // integer state
    const [spectators, setSpectators] = React.useState([]);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [dataConnections, setDataConnections] = React.useState([]);


    const forceUpdate = () => {


        setValue(value => value + 1); // update state to force render
        // An function that increment 👆🏻 the previous state like here 
        // is better than directly setting `value + 1`
    }





    //TODO EL SERVER RECIVE UNDEFINED EN ALGUN LADO 
    //TODO AL MANDAR LOS USUARIOS AL SERVIDOR LA ID NO COINCIDE?
    //TODO DREAM MUESTRA EL USERNAME DEL USUARIO ESPECTADOR NO DEL TRANMISOR
    //TODO LIMPIAR Y OPTIMIZAR CODIGO
    //TODO HACER QUE DREAM TENGA SONIDO SI EL USUARIO A INTERACIONADO CON LA PAGINA SINO NO.


    useEffect(() => {

        if (user == null) {
            navigate("/");
        }
        socket.on("connect", () => {

            if (peer.open) {

                socket.emit("hello", { id: peer.id + "", username: user.username, room: room });
            } else {

                peer.on("open", (id) => {
                    socket.emit("hello", { id: id + "", username: user.username, room: room });
                });
            }
        });
        socket.on("userlist", (users) => {
            setUsers(users);
        });


        return () => {
            socket.off("connect");
            socket.off("userList");
            socket.off("welcome");
            socket.off("goodbye");
        }

    }, [])


    peer.off('connection').on('connection', (conn) => {
        setInterval(() => {
            var data = Math.random() * 100;
            //console.log(data);
            //conn.send(data);
        }, 100);
        let auxDreams = dreams;
        console.log("AAAAA");

        let stream = dreams[conn.peer]?.stream;
        auxDreams[conn.peer] = {
            username: conn.metadata.username,
            stream: stream,
            data: conn
        }
        setDreams(auxDreams);
        forceUpdate();

    });

    peer.off('call').on('call', (call) => {
        call.answer();
        call.on("iceStateChanged", (e) => {
            if (e == "disconnected") {

            }
        })
        console.log("AAAAA");

        call.on('stream', (stream) => {
            var test = stream.getVideoTracks()[0];


            console.log("AAAAA");
            var auxDreams = dreams;
            let data = auxDreams[call.peer]?.data;
            auxDreams[call.peer] = {
                username: call.metadata.username,
                stream: stream,
                data: data
            }

            //setDreams(auxDreams);
            forceUpdate();
        });


        call.on("error", (e) => {
            console(e);
            var auxDreams = dreams;
            delete auxDreams[call.peer];
            setDreams(auxDreams);
        })
    })



    socket.off("welcome").on("welcome", (user) => {
        if (users.find(u => u.username == user.username)) {
            return;
        }

        enqueueSnackbar(user.username + " se a conectado!", { variant: 'success' })

        setUsers((prevUsers) => {
            prevUsers = prevUsers.filter(Boolean);// algunos ids son strings otros no por algun motivo
            return [
                ...prevUsers,
                user
            ]
        })
        if (stream) {

            peer.call(user.id, stream, { metadata: { username: user.username } })

        }
    })
    socket.off("goodbye").on("goodbye", (id) => {

        var user = users.find(u => u.id == id);

        if (user) {
            enqueueSnackbar(user.username + " se a desconectado :c", { variant: 'error' });
            var auxUsers = users;
            delete auxUsers[users.indexOf(user)];
            setUsers(auxUsers);
        }
        var auxDreams = dreams;


        delete auxDreams[id];

        setDreams(auxDreams);
        forceUpdate();


    })

    socket.off("wakeUp").on("wakeUp", (id) => {

        var auxDreams = dreams;

        delete auxDreams[id];
        setDreams(auxDreams);
        forceUpdate();
    })

    const startScreenCap = () => {





        var video_constraints = {

            optional: []
        };

        navigator.mediaDevices.getDisplayMedia({ video: video_constraints, audio: true }).then(

            (stream) => {
                setLocalStream(stream);


                users.map((user) => {
                    var e = peer.connect(user.id, { metadata: { username: user.username } });
                    e.addListener("open", () => {
                        e.send("hello");
                    })
                    e.addListener("data", (data) => {
                        console.log(data);
                    })
                    var spectator = peer.call(user.id, stream, { metadata: { username: user.username } });

                    if (spectators) {
                        setSpectators((prevSpectators) => [
                            ...prevSpectators,
                            spectator
                        ]);
                    } else {
                        setSpectators([spectator]);
                    }
                });


                stream.getVideoTracks()[0].onended = function () {
                    toggleScreenCap(false);
                    stopScreenCap();

                };

            }

        )
    }
    const stopScreenCap = () => {
        console.log("stopping...")
        if (stream) {
            stream.getVideoTracks().forEach((track) => { track.stop() })
        }
        setLocalStream(null);
        socket.emit("stop", { room: room });
        spectators.forEach((call) => { call.close() })
        setSpectators.apply([]);


    }
    const screenCapHandler = () => {

        toggleScreenCap(!isScreenCapOn);
        if (!isScreenCapOn) {
            startScreenCap();
        } else {
            stopScreenCap();
        }

    }
    return (
        <>
            <div className="roomBack" >
                <div className="dreamContainer grid" >
                    {Object.keys(dreams).map((key) => {
                        return <Dream stream={dreams[key].stream} data={dreams[key].data} username={dreams[key].username}></Dream>
                    })}
                </div>
                {isScreenCapOn &&
                    <Draggable bounds="parent">
                        <div className='🎈'>
                            {stream && <LocalDream stream={stream} />}
                        </div>
                    </Draggable>
                }
                <Box className="callOptions">
                    <IconButton onClick={() => { expandOptions(!isOptionsExpanded) }} className='showOptions' size='large'>
                        <Icon sx={{ color: "white" }}>{isOptionsExpanded ? "expand_more" : "expand_less"}</Icon>
                    </IconButton>
                    <Slide direction='up' in={isOptionsExpanded}>
                        <Box>
                            <Fab onClick={() => { toggleMic(!isMicOn) }} color={isMicOn ? "primary" : "error"} >
                                <Icon>
                                    {isMicOn ? "mic" : "mic_off"}
                                </Icon>
                            </Fab>
                        </Box>
                    </Slide>
                    <Slide direction='up' timeout={{ enter: 500, exit: 500 }} in={isOptionsExpanded}>
                        <Box>
                            <Fab onClick={screenCapHandler} color={isScreenCapOn ? "secondary" : "primary"}>
                                <Icon >
                                    desktop_windows
                                </Icon>
                            </Fab>
                        </Box>
                    </Slide>
                    <Slide direction='up' timeout={{ enter: 1000, exit: 1000 }} in={isOptionsExpanded}>
                        <Box>
                            <Fab onClick={() => { toggleAudio(!isAudioOn) }} color={isAudioOn ? "primary" : "error"}>
                                <Icon >
                                    headphones
                                </Icon>
                            </Fab>
                        </Box>
                    </Slide>
                </Box>
                {user && <UserList user={user} users={users} />}

            </div>

        </>
    );

}
export default Room;
function Dream(props) {
    const [hover, setHover] = React.useState(false);
    const [volume, setVolume] = React.useState(0);
    const [play, setPlay] = React.useState(false);
    const [soundOn, setSoundOn] = React.useState(false);
    const [maximized, setMaximized] = React.useState(false);


    const videoReadyHandler = (e) => { // Inecesario, el video no se reproduce por que no interactua el usuario con la pagina. (Mutear el video, hacer que el usuario desmuteo)
        delay(100).then(() => {
            try {
                var a = e.player.player.player.play();
            } catch (e) {
                console.log(e);
            }
        });


    }


    const doubleClickHandler = (e) => {

        var target = e.target.parentElement.parentElement.parentElement;
        console.log(target);
        if (target.classList.contains("☁")) {

            var parent = target.parentElement;
            parent.classList.toggle("grid");
            target.classList.toggle("maximized")
            setMaximized(!maximized);
            setHover(false);
        }
        if (!maximized) {
            //remove all listeners

            //document.addEventListener("keydown", handleKeyDown);
            //document.addEventListener("keyup", handleKeyUp);
            $(document).on("keydown", handleKeyDown);
            $(document).on("keyup", handleKeyUp);
        } else {
            //document.removeEventListener("keydown", handleKeyDown);
            //document.removeEventListener("keyup", handleKeyUp);
            $(document).off("keydown");
            $(document).off("keyup");
        }



    }
    const handleMouseOver = (e) => {
        if (!maximized) {
            setHover(true)

        }
    }
    const handleMouseMove = (e) => {
        if (!props.data) {
            return;
        }
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        //get element height and width
        var maxX = e.target.clientWidth;
        var maxY = e.target.clientHeight;
        //normalize x and y
        x = x / maxX;
        y = y / maxY;



        props.data.send({ type: "mousemove", pos: { x: x, y: y } });



    }
    const handleMouseDown = (e) => {
        if (!props.data) {
            return;
        }
        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        //get element height and width
        var maxX = e.target.clientWidth;
        var maxY = e.target.clientHeight;
        //normalize x and y
        x = x / maxX;
        y = y / maxY;
        props.data.send({ type: "mousedown", pos: { x: x, y: y } });

    }
    const handleScroll = (e) => {
        if (!props.data) {
            return;
        }

        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        //get element height and width
        var maxX = e.target.clientWidth;
        var maxY = e.target.clientHeight;
        //normalize x and y
        x = x / maxX;
        y = y / maxY;

        var scroll = e.deltaY;
        console.log(scroll);
        props.data.send({ type: "scroll", scroll: scroll, pos: { x: x, y: y } });
    }
    const handleMouseUp = (e) => {
        if (!props.data) {
            return;
        }

        var mtype;
        //check if right click
        if (e.button == 2) {
            mtype = "right";
        } else if (e.button == 0) {
            mtype = "left";
        } else {
            mtype = "middle";
        }

        var rect = e.target.getBoundingClientRect();
        var x = e.clientX - rect.left; //x position within the element.
        var y = e.clientY - rect.top;  //y position within the element.
        //get element height and width
        var maxX = e.target.clientWidth;
        var maxY = e.target.clientHeight;
        //normalize x and y
        x = x / maxX;
        y = y / maxY;
        props.data.send({ type: "mouseup", pos: { x: x, y: y }, mtype: mtype });


    }
    const handleKeyDown = (e) => {
        if (!props.data) {
            console.log(e);
            return;
        }
        //win key
        if(e.key == "Meta"){
            return;
        }
        console.log(e);
        props.data.send({ type: "keydown", key: e.key.toLowerCase() });
    }
    const handleKeyUp = (e) => {
        if (!props.data) {
            console.log(e);
            return;
        }
        //win key
        if(e.key == "Meta"){
            return;
        }

        console.log(e);

        props.data.send({ type: "keyup", key: e.key.toLowerCase() });
    }

    //onMouseEnter={handleMouseOver} onDoubleClick={doubleClickHandler} onMouseLeave={() => { setHover(false) }} 
    return (
        <>

            <div

                className="☁" >
                <div className='fullscreen'>
                    <IconButton onClick={doubleClickHandler} size='large'>
                        <Icon sx={{ color: "white" }}>{maximized ? "fullscreen_exit" : "fullscreen"}</Icon>
                    </IconButton>
                </div>
                <Collapse style={{ zIndex: 100, position: "absolute", width: "100%" }} in={hover}>
                    <Paper square style={{ opacity: 0.5, backdropFilter: "blur(50px)" }}  >
                        <Box justifyContent={"center"} textAlign={"center"}><Typography fontWeight={"bold"}>{props.username}</Typography></Box>
                    </Paper>
                </Collapse>
                {!play &&
                    <Box className='loading'>
                        <CircularProgress />
                    </Box>}

                <div

                    onMouseMove={
                        handleMouseMove
                    }
                    onMouseDown={
                        handleMouseDown
                    }

                    onMouseUp={
                        handleMouseUp
                    }
                    onWheel={
                        handleScroll
                    }
                    onKeyDown={() => { console.log("keydown") }}



                    className="streamContainer" >


                    <ReactPlayer config={{
                        file: {
                            attributes: { 'preload': 'none', 'muted': true }
                        }
                    }} muted={!soundOn} volume={soundOn ? 100 : 0} onPlay={() => { setPlay(true); }

                    } onReady={videoReadyHandler} width='100%' height="100%" url={props.stream}></ReactPlayer>

                </div>
                <Box className="options">
                    <Zoom in={hover}>
                        <Fab onClick={() => { setSoundOn(!soundOn) }} sx={{ margin: "10px" }}>
                            <Icon >
                                {soundOn ? "volume_up" : "volume_mute"}
                            </Icon>

                        </Fab>
                    </Zoom>
                </Box>


            </div>
        </>
    )
}
function LocalDream(props) {
    const [hover, setHover] = React.useState(false);


    return (
        <>
            <div onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }} className="🏠☁" >
                <div className="streamContainer" >
                    <ReactPlayer playing volume={0} muted width='99%' height="100%" url={props.stream}
                        config={{
                            file: {
                                attributes: {

                                }
                            }
                        }}

                    ></ReactPlayer>
                </div>


            </div>
        </>
    )

}

function UserList(props) {
    const users = renderUsers(props.users);

    users.push(<div>{props.user.username}</div>)
    return (

        <div className='userList ☁'>

            {users}


        </div>
    )

}
function renderUsers(users) {

    if (users.length > 0) {
        return users.map((user, index) => {

            return <div>{user.username}</div>
        })
    } else {
        return [];
    }

}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
