import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, TextField, InputAdornment, Paper, Box, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material"
import image from "../back.jpg"
import { Buffer } from 'buffer';
import useLocalStorage from '../Hooks/MyHooks';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { v4 } from 'uuid';
function Login(props) {
    const theme = useTheme();
    const io = props.socket;
    const [user, setUser] = useLocalStorage('user', null);
    const [usernameValue, setUsername] = useState('')
    const [PasswordValue, setPassword] = useState('')
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [isLoginPage, setIsLoginPage] = useState(true);


    let navigate = useNavigate();
    const updateUsername = (e) => {
        const val = e.target.value;
        setUsername(val)
    }
    useEffect(() => {
        if (user && false) {
            navigate("/Room/" + getRandomName(), { state: { user: user.username, user_id: user.user_id } });
        }
    }, [user])
    


    const updatePassword = (e) => {
        const val = e.target.value;
        setPassword(val)
    }
    const loginOrRegister = () => {

        if (isLoginPage) {
            login();
        }
        else {
            register();
        }

        //setUser({username:usernameValue,user_id:call.user_id});
        //navigate("/Room", { state: { user: usernameValue } });
        //window.location.reload();


    }
    const login = () =>{
        io.emit("login", { username: usernameValue, password: PasswordValue });

    }
    const register = () => {

        if (false && PasswordValue.length < 8 ) {
            enqueueSnackbar("Password must be at least 8 characters", { variant: 'error' })
            return;
        }

        io.emit("register", { username: usernameValue, password: PasswordValue });
    }

    io.off('login').on('login', (call) => {
        console.log(call);
        if (call.success) {
            setUser({ username: usernameValue, user_id: call.user_id });
            navigate("/Room/" + getRandomName());
            enqueueSnackbar("Welcome " + call.username, { variant: 'success' })

            //window.location.reload();
        }
        else {
            enqueueSnackbar("Login Failed", { variant: 'error' })
        }
    });
    io.off('register').on('register', (call) => {
        console.log(call);
        if (call.success) {
            setIsLoginPage(true);
            //window.location.reload();
        }
        else {
            enqueueSnackbar("Register Failed", { variant: 'error' })
        }
    });


    const flexBox = {
        transition: "0.5s",
        display: "flex",
        flexFlow: "column",
        padding: "50px",
        paddingTop: "20px",
        paddingBottom: "20px",
        borderRadius: "25px",
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        //opacity
        backgroundColor: theme.palette.primary.main + "50",


        // add background blur  
        backdropFilter: "blur(5px)",

    }
    const background = {
        backgroundImage: `url(${image})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
    }

    const selectedButton = {
        transition: "0.5s",
        backgroundColor: theme.palette.primary.dark.replace("rgb", "rgba").replace(")", ",0.5)"),
        color: theme.palette.primary.contrastText,
        fontWeight: "bold",
        textAlign: "center",
    }
    const unselectedButton = {
        transition: "0.5s",
        backgroundColor: theme.palette.primary.main + "50",
        color: theme.palette.primary.contrastText,
        fontWeight: "bold",
        textAlign: "center",
    }

    return (
        <div style={background}>
            <Container maxWidth="md">
                <Paper
                    elevation={5}
                    style={flexBox} square >
                    <Typography style={
                        {
                            color:theme.palette.primary.contrastText,
                            fontWeight: "bold",
                            fontSize: "30px",
                            textAlign: "center",
                            marginBottom: "10px"
                        }
                    } fontWeight={"bold"}>{isLoginPage?"Login":"Register"}</Typography>
                    
                    <TextField
                        style={{ marginBottom: "5px" }}
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
                        style={{ marginBottom: "5px" }}

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
                        onKeyDown={evt => { if (evt.key === 'Enter') { loginOrRegister() } }}
                        onChange={evt => updatePassword(evt)}
                        id="outlined-basic"
                        label="Password"
                        variant="filled" />
                     <TextField
                        type="password"
                        style = {{
                            opacity: isLoginPage ? "0" : "1",
                            maxHeight: isLoginPage ? "0px" : "100px",
                            
                            transition: "0.5s",
                            marginBottom: "5px",

                         }}
                        InputProps={{
                            style: {
                                color: "white"
                            }
                        }} InputLabelProps={{
                            style: {
                                color: "white",
                            }
                        }}
                        onKeyDown={evt => { if (evt.key === 'Enter') { register() } }}
                        onChange={evt => updatePassword(evt)}
                        id="outlined-basic"
                        label="Confirm Password"
                        variant="filled" />

                    <Button style={{
                        marginTop: "5px",
                        backgroundColor: theme.palette.secondary.main,
                        color:theme.palette.secondary.contrastText,
                    }}
                        onClick={loginOrRegister} variant='contained'>{isLoginPage ? "Login" : "Register"}</Button>
                    <ToggleButtonGroup
                        color="primary"

                        value={isLoginPage}
                        onChange={(e, val) => {
                            setIsLoginPage(val);
                        }}
                        exclusive
                        aria-label="text alignment"
                        style={{
                            
                            marginTop: "20px",
                            alignSelf: "center",
                            backgroundColor: theme.palette.primary.main + "50",
                        }}
                    >
                        <ToggleButton value={true}
                            style={isLoginPage ? selectedButton : unselectedButton}
                        >
                            Login</ToggleButton>
                        <ToggleButton 
                        style={isLoginPage ? unselectedButton : selectedButton}
                        value={false} >Register</ToggleButton>
                    </ToggleButtonGroup>
                </Paper>

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
        if (base64String == null) {
            return getRandomName();
        }

        return base64String;
    }

}
export default Login;