import { Fab, Icon, IconButton, Slide, Zoom, CircularProgress, Snackbar, Alert, Paper, Typography, Collapse, Modal, Button, SvgIcon } from '@mui/material';
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
import { ReactComponent as Duck } from '../duck.svg'
import { ReactComponent as DuckW } from '../duckw.svg'

import { useTheme } from '@mui/material/styles';

const peer = new Peer({

});


function Room(props) {
    let navigate = useNavigate();
    const { room } = useParams()

    const socket = props.socket;
    const [dreams, setDreams] = React.useState({});
    const [dreamData, setDreamData] = React.useState({});//{username:username,stream:stream,data:data}
    const [isOptionsExpanded, expandOptions] = React.useState(true);
    const [isDreamsExpanded, expandDreams] = React.useState(true);
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
    const [modalOpen, setModalOpen] = React.useState(false);
    const [mainUserStream, setMainUserStream] = React.useState(null);
    const [mainDream, setMainDream] = React.useState(null);//{username:username,stream:stream,data:data}
    const [mainDreamData, setMainDreamData] = React.useState(null);//{username:username,stream:stream,data:data}
    const theme = useTheme();

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
        socket.off("connect").on("connect", () => {

            if (peer.open) {
                console.log(peer.id);

                socket.emit("hello", { id: peer.id + "", username: user.username, room: room });
            } else {


                peer.on("open", (id) => {
                    console.log(peer.id);
                    socket.emit("hello", { id: id + "", username: user.username, room: room });
                });
            }
        });
        socket.off("userlist").on("userlist", (users) => {
            console.log("userlist");
            setUsers(users);
        });


        /*return () => {
            socket.off("connect");
            socket.off("userList");
            socket.off("welcome");
            socket.off("goodbye");
        }*/

    }, [])

    useEffect(() => {
        if (mainUserStream != null && mainDreamData != null){
        setMainDream(<Dream key={mainUserStream?.stream.id}
             user={user} color={theme.palette.primary.main} stream={mainUserStream?.stream}
            data={mainDreamData?.data}
            username={mainUserStream?.username}></Dream>);}
    }, [mainUserStream, mainDreamData])
    //esto es cuando se envia DataConnection cambiar a call
    peer.off('connection').on('connection', (conn) => {
        conn.on("data", (data) => {
            console.log(data);
        })
        /*let auxDreams = dreams;
        console.log("AAAAA");

        let stream = dreams[conn.peer]?.stream;
        auxDreams[conn.peer] = {
            username: conn.metadata.username,
            stream: stream,
            data: conn
        }
        if (mainUserStream == null) {
            setMainUserStream(
                {
                    username: conn.metadata.username,
                    stream: stream,
                    data: conn
                }
            );
        }
        

        //setDreams(auxDreams);

        forceUpdate();*/
        let auxDreamData = dreamData;
        auxDreamData[conn.peer] = {
            data: conn,
        }
        setDreamData(auxDreamData);
        if (mainDreamData == null) {
            setMainDreamData(auxDreamData[conn.peer]);
        }


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
            //var test = stream.getVideoTracks()[0];

            //console.log("AAAAA");
            var auxDreams = dreams;
            let data = auxDreams[call.peer]?.data;
            auxDreams[call.peer] = {
                username: call.metadata.username,
                stream: stream,
            }
            if (mainUserStream == null) {
                setMainUserStream(
                    {
                        username: call.metadata.username,
                        stream: stream,
                    }
                );
            }
            setDreams(auxDreams);
            forceUpdate();
        });

        call.on("error", (e) => {
            console(e);

        })
        call.on("close", (e) => {
            var user = users.find(u => u.id == e);
            var auxDreams = dreams;
            //delete auxDreams[call.peer];

            if (mainUserStream?.username == user.username) {
                if (Object.keys(dreams).filter((key) => dreams[key].stream != mainUserStream.stream).length > 0) {
                    setMainUserStream({ username: dreams[Object.keys(dreams)[0]].username, stream: dreams[Object.keys(dreams)[0]].stream });
                } else {
                    setMainUserStream(null);
                }
            }
            var auxDreamData = dreamData;
            delete auxDreamData[call.peer];
            setDreamData(auxDreamData);
            let d = auxDreams[call.peer];
            if (d != null) {
                delete auxDreams[call.peer];
            }
            setDreams(auxDreams);

        });
    })

    socket.off("welcome").on("welcome", (user) => {
        console.log(user);

        if (users.find(u => u.username == user.username)) {
            // return; TODO quitar
        }

        enqueueSnackbar(user.username + " se a conectado!", { variant: 'success' })

        setUsers((prevUsers) => {
            //prevUsers = prevUsers.filter(Boolean);// algunos ids son strings otros no por algun motivo
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
            //delete auxUsers[users.indexOf(user)];
            let index = auxUsers.indexOf(user);
            if (index > -1) {
                auxUsers.splice(index, 1);
            }

            setUsers(auxUsers);


            if (mainUserStream?.username == user.username) {
                if (Object.keys(dreams).filter((key) => dreams[key].stream != mainUserStream.stream).length > 0) {
                    setMainUserStream({ username: dreams[Object.keys(dreams)[0]].username, stream: dreams[Object.keys(dreams)[0]].stream });
                } else {
                    setMainUserStream(null);
                }
            }

        }
        Object.keys(dreamData).forEach((key) => {
            if (key == id) {
                if (dreamData[key].data.peer == id) {
                    let auxDreamData = dreamData;
                    delete auxDreamData[key];
                    setDreamData(auxDreamData);
                }
                let aux = dreams[key];
                if (dreams[key] != null) {

                    if (dreams[key].stream == mainUserStream.stream) {
                        if (Object.keys(dreams).filter((key) => dreams[key].stream != mainUserStream.stream).length > 0) {
                            setMainUserStream({ username: dreams[Object.keys(dreams)[0]].username, stream: dreams[Object.keys(dreams)[0]].stream });
                        } else {
                            setMainUserStream(null);
                        }
                    }
                    let auxDreams = dreams;
                    delete auxDreams[key];
                    setDreams(auxDreams);
                }
            }
        })




        var auxDreamData = dreamData;
        delete auxDreamData[id];
        setDreamData(auxDreamData);

        var auxDreams = dreams;
        //delete auxDreams[id];
        let d = auxDreams[id];
        if (d != null) {
            delete auxDreams[id];
        }
        setDreams(auxDreams);


        forceUpdate();

    })

    socket.off("wakeUp").on("wakeUp", (id) => {
        var user = users.find(u => u.id == id);


        var auxDreams = dreams;
        //delete auxDreams[call.peer];

        if (mainUserStream?.username == user.username) {
            if (Object.keys(dreams).filter((key) => dreams[key].stream != mainUserStream.stream).length > 0) {
                setMainUserStream({ username: dreams[Object.keys(dreams)[0]].username, stream: dreams[Object.keys(dreams)[0]].stream });
            } else {
                setMainUserStream(null);
            }
        }
        var auxDreamData = dreamData;
        delete auxDreamData[id];
        setDreamData(auxDreamData);
        let d = auxDreams[id];
        if (d != null) {
            delete auxDreams[id];
        }
        setDreams(auxDreams);
    })

    const startScreenCap = () => {
        var video_constraints = {

            optional: []
        };

        navigator.mediaDevices.getDisplayMedia({ video: video_constraints, audio: true }).then(

            (stream) => {
                setLocalStream(stream);
                console.log(user)

                users.map((userAux) => {
                    var e = peer.connect(userAux.id, { metadata: { username: user.username } });
                    e.addListener("open", () => {
                        e.send("hello");

                    })
                    e.addListener("data", (data) => {
                        console.log(data);
                    })
                    var spectator = peer.call(userAux.id, stream, { metadata: { username: user.username } });

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
    const clientHandler = () => {
        window.open("dream:" + room + "@@@" + user.username, '_blank');
        enqueueSnackbar(<p>Es necesario <a href={process.env.PUBLIC_URL+ "/DreamReact%20Setup.exe"}>Descargar</a> la app</p>, { variant: 'info' });
    
    }
    const screenCapHandler = () => {

        toggleScreenCap(!isScreenCapOn);
        if (!isScreenCapOn) {
            startScreenCap();
        } else {
            stopScreenCap();
        }

    }

    const expandDreamsHandler = () => {
        expandDreams(!isDreamsExpanded);
    }

    const changeMainDream = (peerid) => {

        setMainUserStream({ username: dreams[peerid].username, stream: dreams[peerid].stream });
        setMainDreamData(dreamData[peerid]);
        forceUpdate();
    }


    return (
        <>
            <div className="roomBack" >


                <div className="dreamContainer " >
                    <div className="MainDream">
                        {/*
 <Dream username="aaa"></Dream>
                            */}
                        {/*mainUserStream != null &&
                            <Dream user={user} color={theme.palette.primary.main} stream={mainUserStream.stream}
                                data={mainDreamData?.data}
                                username={mainUserStream.username}></Dream>
                        */}
                        {mainDream}

                    </div>


                    {mainUserStream != null && Object.keys(dreams).filter((key) => dreams[key].stream != mainUserStream.stream).length > 0 &&


                        <div className='sideList' style={{ maxHeight: isDreamsExpanded ? "100%" : "0px" }}>
                            <IconButton style={{ position: 'absolute', top: '-30px' }} >
                                <Icon className="icon" onClick={expandDreamsHandler} sx={{ color: "white" }}>{isDreamsExpanded ? "expand_more" : "expand_less"}</Icon>
                            </IconButton>
                            {/*
                                <Dream></Dream>
                                <Dream></Dream>
                                <Dream></Dream>
                                <Dream></Dream>
                            */}
                            {Object.keys(dreams).filter((key) => dreams[key].stream != mainUserStream.stream).map((key) => {
                                return <Dream key={dreams[key].stream.id} onClick={()=>{changeMainDream(key)}} user={user} color={theme.palette.primary.main} stream={dreams[key].stream} username={dreams[key].username}></Dream>
                            })}


                        </div>}

                </div>
                {/*
                <div className="dreamContainer grid" >
                    {Object.keys(dreams).map((key) => {
                        return <Dream user={user} color={theme.palette.primary.main} stream={dreams[key].stream} data={dreams[key].data} username={dreams[key].username}></Dream>
                    })}
                    <Dream></Dream>
                </div>*/ }
                {isScreenCapOn &&
                    <Draggable bounds="parent">
                        <div className='🎈'>
                            {stream && <LocalDream stream={stream} />}
                        </div>
                    </Draggable>
                }
                <Box className="callOptions">


                    <Slide direction='down' timeout={{ enter: 500, exit: 500 }} in={isOptionsExpanded}>
                        <Box>
                            <Fab onClick={screenCapHandler} color={isScreenCapOn ? "secondary" : "primary"}>
                                <Icon >
                                    desktop_windows
                                </Icon>
                            </Fab>
                        </Box>
                    </Slide>
                    <Slide direction='down' timeout={{ enter: 500, exit: 500 }} in={isOptionsExpanded}>
                        <Box>
                            <Fab onClick={clientHandler} color="primary">
                                {theme.palette.mode == "dark" ?
                                    <SvgIcon component={DuckW} inheritViewBox /> :
                                    <SvgIcon component={DuckW} inheritViewBox />
                                }
                            </Fab>
                        </Box>
                    </Slide>
                    <IconButton onClick={() => { expandOptions(!isOptionsExpanded) }} className='showOptions' size='large'>
                        <Icon sx={{ color: "white" }}>{isOptionsExpanded ? "expand_more" : "expand_less"}</Icon>
                        <Typography sx={{ color: "white" }}>Cast</Typography>
                    </IconButton>
                </Box>
                {
                    /*
                user && <UserList user={user} users={users} />
                */
                }

            </div>

            <Modal open={modalOpen} >
                <Box className="modal">
                    <Typography variant="h4">Descarga la app para una mejor experiencia</Typography>
                    <Typography variant="h6">La app esta en desarrollo, por ahora solo esta disponible para windows</Typography>
                    <Typography variant="h6">Si tienes problemas con la app, por favor reportalo en el discord</Typography>

                    <Button variant="contained" target="_blank" rel="noopener noreferrer">Descargar</Button>
                </Box>
            </Modal>


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
    const theme = useTheme();
    useEffect(() => {
        if (props.data) {

            $(document).off("keydown").on("keydown", handleKeyDown);
            $(document).off("keyup").on("keyup", handleKeyUp);

            //{ type: "mousedown", pos: { x: x, y: y } }
            console.log("sending  e");
            console.log(props.data);
            if (!props.data.open) {
                props.data.on("open", () => {
                    props.data.send({ type: "welcome", username: props.user, color: props.color });
                }
                )
            } else {
                props.data.send({ type: "welcome", username: props.username, color: props.color });
            }
        }
    }, [null])
    const videoReadyHandler = (e) => { // Inecesario, el video no se reproduce por que no interactua el usuario con la pagina. (Mutear el video, hacer que el usuario desmuteo)
        delay(100).then(() => {
            try {
                var a = e.player.player.player.play();
            } catch (e) {
                console.log(e);
            }
        });


    }

    const handleMouseMove = (e) => {
        if (!props.data || e.target.tagName != "VIDEO") {
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
        if (!props.data || e.target.tagName != "VIDEO") {
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
        if (!props.data || e.target.tagName != "VIDEO") {
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
        if (!props.data || e.target.tagName != "VIDEO") {
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
        if (!props.data ) {
            return;
        }
        //win key
        if (e.key == "Meta") {
            return;
        }
        console.log(e);
        props.data.send({ type: "keydown", key: e.key.toLowerCase() });
    }
    const handleKeyUp = (e) => {
        if (!props.data ) {
            return;
        }
        //win key
        if (e.key == "Meta") {
            return;
        }

        console.log(e);

        props.data.send({ type: "keyup", key: e.key.toLowerCase() });
    }
    //onMouseEnter={handleMouseOver} onDoubleClick={doubleClickHandler} onMouseLeave={() => { setHover(false) }} 
    return (
        <>
            <div
                className="☁"
                style={{
                    backgroundColor: theme.palette.secondary.light.split(")")[0] + ",0.4)",
                }}
                onClick={props.onClick}
            >
                <Typography
                    style={{
                        color: theme.palette.secondary.contrastText,
                        position: "absolute",
                        top: "0px",
                        left: "0px",
                        zIndex: 100,
                        padding: "5px",
                        backgroundColor: theme.palette.secondary.light.split(")")[0] + ",0.4)",
                        borderRadius: "0px 0px 10px 0px",
                        fontweight: "bold",
                        pointerEvents: "none"
                    }}
                >{props.username}</Typography>
                {/*<div className='fullscreen'>
                    <IconButton onClick={doubleClickHandler} size='large'>
                        <Icon sx={{ color: "white" }}>{maximized ? "fullscreen_exit" : "fullscreen"}</Icon>
                    </IconButton>
                </div> */}
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
                    {<ReactPlayer


                        config={{
                            file: {
                                attributes: { 'muted': true, 'preload': "none" }
                            },

                        }} muted={!soundOn} volume={soundOn ? 100 : 0} onPlay={() => { setPlay(true); }
                        } onReady={videoReadyHandler} url={props.stream}></ReactPlayer>

                    }
                </div>
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

    //props.users.push(<div>{props.user.username}</div>)
    return (

        <div className='userList ☁'>
            {props.user && <div>{props.user.username}</div>}

            {props.users.map((user, index) => {
                return <div key={index}>{user.username}</div>
            })
            }


        </div>
    )

}
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
