import React from "react";
import { useLocation } from "react-router-dom";

function Room() {
    let location = useLocation();
        return (
            <>
            <p>{location.state.input}</p>
            </>
        );
    
}
export default Room;