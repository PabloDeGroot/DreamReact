import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, TextField } from "@mui/material"
import image from "../back.png"
import { style } from "@mui/system";
function Login() {


    const [inputValue, setInput] = useState('')

    let navigate = useNavigate();
    const updateInputValue = (e) => {
        const val = e.target.value;
        setInput(val)
    }

    const start = () => {
        navigate("/Room",{state:{input:inputValue}});
    }

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
    const link = {
        pathname: "/category/595212758daa6810cbba4104",
        param1: "Par1"
    }
    return (
        <div style={background}>
            <Container style={flexBox} maxWidth="md">
                <TextField InputProps={{
                    style: {
                        color: "white"
                    }
                }} InputLabelProps={{
                    style: {
                        color: "white",
                    }
                }} style={{ color: "white" }} onChange={evt => updateInputValue(evt)} id="outlined-basic" label="Usuario" variant="outlined" />
                <Button style={{ marginTop: "5px" }} onClick={start} variant='contained'>Enviar</Button>
            </Container>
        </div>
    );



}
export default Login;