import { Fab, Icon, IconButton, Slide, Zoom, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect } from "react";
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player';
import Peer from 'peerjs'; // usado para WebRTC
import { io } from 'socket.io-client'; //usado para administrar usuarios

var peer = new Peer({

});
const socket = io(":2000"); // TODO añadir dominio como parametro


function Room() {
    const [dreams, setDreams] = React.useState({});
    const [isOptionsExpanded, expandOptions] = React.useState(true);
    const [isMicOn, toggleMic] = React.useState(true);
    const [isScreenCapOn, toggleScreenCap] = React.useState(false);
    const [isAudioOn, toggleAudio] = React.useState(true);
    const [stream, setLocalStream] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [value, setValue] = React.useState(0); // integer state

    const forceUpdate = () => {

        setValue(value => value + 1); // update state to force render
        // An function that increment 👆🏻 the previous state like here 
        // is better than directly setting `value + 1`
    }




    useEffect(() => {
        socket.on("connect", () => {
            if (peer.open) {
                socket.emit("hello", { id: peer.id, username: "test" });
            } else {
                peer.on("open", (id) => {
                    socket.emit("hello", { id: id, username: "test" });
                });
            }
        });
        socket.on("userlist", (users) => {
            console.log(users);
            setUsers(users);
        });
        socket.on("welcome", (user) => {
            console.log(user);
            setUsers((prevUsers) => [
                ...prevUsers,
                user
            ])
        })

        return () => {
            socket.off("connect");
            socket.off("userList");
            socket.off("welcome");
        }

    }, [])


    peer.removeListener('call').on('call', (call) => {

        call.answer();
        call.on('stream', (stream) => {
            var test = stream.getVideoTracks()[0];
            console.log(test);
            var auxDreams = dreams;
            auxDreams[call.peer] = {
                username: call.metadata.username,
                stream: stream
            }
            setDreams(auxDreams);
            console.log(auxDreams);
            console.log(dreams);
            forceUpdate();


        })

    })



    const startScreenCap = () => {

        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then(

            (stream) => {
                setLocalStream(stream);
                console.log(users);

                users.map((user) => (
                    peer.call(user.id, stream, { metadata: { username: user.username } })
                ));


                stream.getVideoTracks()[0].onended = function () {
                    toggleScreenCap(false);
                    stopScreenCap();
                };

            }

        )
    }
    const stopScreenCap = () => {
        console.log("stopping...")
        setLocalStream(null);
        stream.getTracks().forEach(track => track.stop())
    }
    const screenCapHandler = () => {
        console.log("test");
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
                <div test={dreams} className="dreamContainer grid" >
                    {Object.keys(dreams).map((key) => {
                        console.log(dreams[key]);
                        return <Dream stream={dreams[key].stream} username={dreams[key].username}></Dream>
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
                                <Icon >
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
            </div>
        </>
    );

}
export default Room;
function Dream(props) {
    const [hover, setHover] = React.useState(false);
    const [volume, setVolume] = React.useState(50);
    const [play, setPlay] = React.useState(false);
    const [soundOn, setSoundOn] = React.useState(props.soundOn);

    const videoReadyHandler = (e) => {
        delay(1000).then(() => { e.player.player.play(); });
        console.log(e);
        setPlay(true);
    }

    const doubleClickHandler = (e) => {

        var target = e.target;
        if (target.classList.contains("☁")) {
            console.log(target);
            var parent = target.parentElement;
            parent.classList.toggle("grid");
            target.classList.toggle("maximized")
            setHover(false);
        }
    }
    const handleMouseOver = (e) => {
        if (!e.currentTarget.classList.contains("maximized")) {
            setHover(true)
            console.log(props);
        }
    }
    return (
        <>
            <div onMouseEnter={handleMouseOver} onDoubleClick={doubleClickHandler} onMouseLeave={() => { setHover(false) }} className="☁" >
                {!play && <Box className='loading'>
                    <CircularProgress />
                </Box>}

                <div className="streamContainer" >


                    <ReactPlayer onReady={videoReadyHandler} width='100%' height="100%" url={props.stream}></ReactPlayer>

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
                    <ReactPlayer playing muted width='100%' height="100%" url={props.stream}></ReactPlayer>
                </div>
                <Box className="options">

                </Box>

            </div>
        </>
    )

}

class User {
    constructor(id, username) {
        this.id = id;
        this.username = username;

    }
    call(peer, stream, user) {
        peer.call(this.id, stream, user)
            .on('stream',
                (stream) => {
                    return <Dream stream={stream} />
                }
            ).on('error',
                () => { }
            ).on('close',
                () => { }
            )
    }
}
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}