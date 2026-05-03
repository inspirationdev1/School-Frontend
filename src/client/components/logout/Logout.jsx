import axios from "axios"
import { useContext, useEffect } from "react"
import { baseUrl } from "../../../environment"
import { useDispatch } from "react-redux"
import { logout } from "../../../state/loginSlice"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../../context/AuthContext"

export default function Logout() {
    const { logout, user } = useContext(AuthContext)
    const navigate = useNavigate()
    useEffect(() => {
        console.log(user);
        logout()

        console.log("usertest:",user?.role);
        // if (user?.role.toLowerCase()==="school"){
        //     navigate("/login/school");
        // }else{

        //     navigate("/login/"+user?.role.toLowerCase());
        // }
        navigate("/login/"+user?.role.toLowerCase());
        // navigate("/login")
    }, [])
    return (
        <>
            <h1>Log Out</h1></>
    )
}