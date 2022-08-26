import { Fab, Icon, IconButton, Slide, Zoom } from '@mui/material';
import { Box } from '@mui/system';
import React from "react";
import { useLocation } from "react-router-dom";


function Room() {
    const [dreams, setDreams] = React.useState({ username: <Dream /> });
    const [isOptionsExpanded, expandOptions] = React.useState(true);
    const [isMicOn, toggleMic] = React.useState(true);
    const [isScreenCapOn, toggleScreenCap] = React.useState(false);
    const [isAudioOn, toggleAudio] = React.useState(true);
    return (
        <>
            <div className="roomBack" >
                <div className="dreamContainer grid" >
                    <Dream />
                </div>
                <Box className="callOptions">
                    <IconButton onClick={() => { expandOptions(!isOptionsExpanded) }} className='showOptions' size='large'>
                        <Icon sx={{ color: "white" }}>{isOptionsExpanded ? "expand_more" : "expand_less"}</Icon>

                    </IconButton>
                    <Slide direction='up' in={isOptionsExpanded}>
                        <Box>
                            <Fab onClick={()=>{toggleMic(!isMicOn)}}color={isMicOn ? "primary" : "error"} >
                                <Icon >
                                    {isMicOn?"mic":"mic_off"}
                                </Icon>
                            </Fab>
                        </Box>
                    </Slide>
                    <Slide direction='up' timeout={{ enter: 500, exit: 500 }} in={isOptionsExpanded}>
                        <Box>
                            <Fab color="primary">
                                <Icon >
                                    desktop_windows
                                </Icon>
                            </Fab>
                        </Box>
                    </Slide>
                    <Slide direction='up' timeout={{ enter: 1000, exit: 1000 }} in={isOptionsExpanded}>
                        <Box>
                            <Fab color="primary">
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
                    transmision de pantalla aqui
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