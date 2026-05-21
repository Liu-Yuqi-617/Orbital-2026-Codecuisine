import { useState } from "react"

function Login() {

    const [username, setUsername] =
        useState("")

    const [password, setPassword] =
        useState("")

    function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault()

        console.log(username)

        console.log(password)
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
        </form>

    )

}

export default Login