import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, TextField, InputAdornment } from "@mui/material"
import image from "../back.jpg"
import axios from "axios";
import {Buffer} from 'buffer';

import { useSnackbar } from 'notistack';
import { v4 } from 'uuid';
function Login(props) {

    const io = props.socket;


    const [usernameValue, setUsername] = useState('')
    const [PasswordValue, setPassword] = useState('')
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let navigate = useNavigate();
    const updateUsername = (e) => {
        const val = e.target.value;
        setUsername(val)
    }

    const updatePassword = (e) => {
        const val = e.target.value;
        setPassword(val)
    }
    const login = () => {

        io.emit("login", { username: usernameValue, password: PasswordValue });
        //navigate("/Room", { state: { user: usernameValue } });
        //window.location.reload();


    }
    const register = () => {
        io.emit("register", { username: usernameValue, password: PasswordValue });
    }



    io.off('login').on('login', (call) => {
        console.log(call);
        if (call.success) {
            navigate("/Room/"+getRandomName(), { state: { user: usernameValue, user_id: call.user_id } });
            enqueueSnackbar("Welcome " + call.username, { variant: 'success' })

            //window.location.reload();
        }
        else {
            enqueueSnackbar("Login Failed", { variant: 'error' })
        }
    });


    const flexBox = {
        display: "flex",
        flexFlow: "column",
        padding: "5px",
        position: 'absolute', left: '50%', top: '45%',
        transform: 'translate(-50%, -45%)',

    }
    const background = {
        backgroundImage: `url(${image})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
    }

    return (
        <div style={background}>
            <Container style={flexBox} maxWidth="md">
                <TextField
                    InputProps={{
                        style: {
                            color: "white"
                        }
                    }} InputLabelProps={{
                        style: {
                            color: "white",
                        }
                    }} onKeyDown={(evt) => { if (evt.key === 'Enter') { login() } }}
                    onChange={evt => updateUsername(evt)}
                    id="outlined-basic"
                    label="User"
                    variant="filled" />
                <TextField
                    type="password"
                    InputProps={{
                        style: {
                            color: "white"
                        }
                    }} InputLabelProps={{

                        style: {
                            color: "white",
                        }
                    }}
                    onKeyDown={evt => { if (evt.key === 'Enter') { login() } }}
                    onChange={evt => updatePassword(evt)}
                    id="outlined-basic"
                    label="Password"
                    variant="filled" />
                <Button style={{ marginTop: "5px" }} onClick={login} variant='contained'>Login</Button>
                <Button style={{ marginTop: "5px" }} onClick={register} variant='contained'>Register</Button>

            </Container>
        </div>
    );

    function getRandomName() {

        let hexString = v4();
        console.log("hex:   ", hexString);
        
        // remove decoration
        hexString = hexString.replace(/-/g, "");
        
        // convert to base64
        let base64String = Buffer.from(hexString, "hex").toString("base64").replace(/[^a-zA-Z ]/g, "");
        
        return base64String;
    }

}
export default Login;