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
            setError("Please fill in all fields");
            alert("Please fill in all fields");
            return;
        }

        if (password !== confirm) {
            setError("Passwords do not match");
            alert("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password should be at least 6 characters");
            return;
        }

        if (username.length < 3 || username.length > 20) {
            setError("Username should be between 3 and 20 characters");
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError("Please enter a valid email address");
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