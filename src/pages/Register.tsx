import { useState } from "react"
import { useNavigate } from "react-router-dom"

import Login from "./Login"

function Register() {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const navigate = useNavigate()

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirm) {

            alert("Passwords do not match")
            return
        }

        navigate("/login")
    }

    return (
        <form onSubmit={handleSubmit}>

            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <br />

            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
    
            <input
                placeholder="Confirm Password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
            />
            <br />


            <button type="submit" onClick={handleSubmit}>
                Register
            </button>
        </form>
    )
}
export default Register;