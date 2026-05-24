import { useState } from "react"

import {
    useNavigate
}
    from "react-router-dom"

import Register from "./Register"

function Login() {

    const [username, setUsername] =
        useState("")

    const [password, setPassword] =
        useState("")

    const navigate = useNavigate()

    function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault()

        console.log(username)

        console.log(password)

        // Navigate to the profile page after successful login
        navigate("/profile")
    }

    return (

        <form
            onSubmit={handleSubmit}
        >

            <h2>Login</h2>


            <input
                value={username}
                onChange={(e) =>
                    setUsername(
                        e.target.value
                    )
                }
                type="text"
                placeholder="Username"
            />

            <br />

            <input
                type="password"
                value={password}
                onChange={(e) =>
                    setPassword(
                        e.target.value
                    )
                }
                placeholder="Password"
            />

            <br />

            <button>
                Login
            </button>

            <button onClick={handleRegister}>
                Register
            </button>

        </form>
    )


    function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        navigate("/register")
    }
}

export default Login