import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as register_api } from "../api";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!username || !email || !password || !confirm) {
            alert("Please fill in all fields");
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirm) {
            alert("Passwords do not match");
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await register_api({
                username,
                email,
                password,
                confirm_password: confirm,
            })
            if (res.data.code == 200) {
                alert("Register successfully");
                navigate("/login");
            } else {
                setError(res.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register");
        }

        console.log({
            username,
            email,
            password,
        });
    }

    return (
        <div>
            <h2>Register</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <br />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <br />

                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br />

                <input
                    placeholder="Confirm Password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />

                <br />

                <button type="submit">
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;