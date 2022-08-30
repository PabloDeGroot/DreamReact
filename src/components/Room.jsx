import { Fab, Icon, IconButton, Slide, Zoom } from '@mui/material';
import { Box } from '@mui/system';
import React from "react";
import Draggable from 'react-draggable';
import ReactPlayer from 'react-player'
import Peers, { Peer } from 'peerjs';

function Room() {
    const [dreams, setDreams] = React.useState({ username: <Dream /> });
    const [isOptionsExpanded, expandOptions] = React.useState(true);
    const [isMicOn, toggleMic] = React.useState(true);
    const [isScreenCapOn, toggleScreenCap] = React.useState(false);
    const [isAudioOn, toggleAudio] = React.useState(true);
    const [stream, setLocalStream] = React.useState(null);
    const [users, setUsers] = React.useState({});
    const peer = new Peer();


    const startScreenCap = () => {
        console.log("starting..")
        navigator.mediaDevices.getDisplayMedia({ video: true }).then(

            (stream) => {
                setLocalStream(stream);
                stream.getVideoTracks()[0].onended = function () {
                    toggleScreenCap(false);
                    setLocalStream(null);
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
                <div className="dreamContainer grid" >
                    <Dream soundOn={true} />
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
    const [soundOn, setSoundOn] = React.useState(props.soundOn);
    const fabStyle = {
        position: 'absolute',

    };

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
                <div className="streamContainer" >
                    <ReactPlayer playing muted width='100%' height="100%" url={stream}></ReactPlayer>
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
    const [stream, setStream] = React.useState(props.stream);
    console.log(stream);

    return (
        <>
            <div onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }} className="🏠☁" >
                <div className="streamContainer" >
                    <ReactPlayer playing muted width='100%' height="100%" url={stream}></ReactPlayer>
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
    call(peer , stream, user) {
        new Peer().call(this.id, stream, user)
            .on('stream',
                (stream) => { 
                    return <Dream ></Dream>
                }
            ).on('error',
                () => { }
            ).on('close',
                () => { }
            )
    }
}

