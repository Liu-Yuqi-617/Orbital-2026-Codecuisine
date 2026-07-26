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




    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        setError("");



        if (
            !username ||
            !email ||
            !password ||
            !confirm
        ) {

            setError(
                "Please fill in all fields"
            );

            return;

        }



        if (password !== confirm) {

            setError(
                "Passwords do not match"
            );

            return;

        }



        if (password.length < 6) {

            setError(
                "Password should be at least 6 characters"
            );

            return;

        }




        if (
            username.length < 3 ||
            username.length > 20
        ) {

            setError(
                "Username should be between 3 and 20 characters"
            );

            return;

        }




        try {


            const res =
                await register_api({

                    username,

                    email,

                    password,

                    confirm_password: confirm,

                });



            if (res.data.code === 200) {

                navigate("/login");

            } else {

                setError(
                    res.data.message
                );

            }


        } catch (err: any) {

            setError(
                err.response?.data?.message ||
                "Failed to register"
            );

        }


    }






    const inputStyle = {

        width: "100%",

        padding: "13px",

        marginTop: "8px",

        marginBottom: "18px",

        borderRadius: "12px",

        border:
            "1px solid #E8E1D9",

        fontSize: "15px",

        boxSizing:
            "border-box" as const,

    };





    return (

        <div

            style={{

                minHeight: "100vh",

                background: "#F7F8FA",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                padding: "40px 20px",

            }}

        >



            <form

                onSubmit={handleSubmit}


                style={{

                    width: "100%",

                    maxWidth: "420px",

                    background: "#FFFFFF",

                    padding: "40px",

                    borderRadius: "22px",

                    boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",

                }}

            >



                <h1

                    style={{

                        textAlign: "center",

                        color: "#E67E22",

                        fontWeight: 800,

                    }}

                >

                    🍽 FoodTrust

                </h1>



                <h2

                    style={{

                        textAlign: "center",

                        color: "#2D3436",

                    }}

                >

                    Create Account

                </h2>




                {
                    error &&

                    <p

                        style={{

                            background: "#FDECEC",

                            color: "#C0392B",

                            padding: "12px",

                            borderRadius: "10px",

                        }}

                    >

                        {error}

                    </p>

                }



                <input

                    placeholder="Username"

                    value={username}

                    onChange={
                        e => setUsername(
                            e.target.value
                        )
                    }

                    style={inputStyle}

                />



                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={
                        e => setEmail(
                            e.target.value
                        )
                    }

                    style={inputStyle}

                />



                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={
                        e => setPassword(
                            e.target.value
                        )
                    }

                    style={inputStyle}

                />



                <input

                    type="password"

                    placeholder="Confirm Password"

                    value={confirm}

                    onChange={
                        e => setConfirm(
                            e.target.value
                        )
                    }

                    style={inputStyle}

                />




                <button

                    type="submit"

                    onClick={
                        () => navigate("/login")
                    }

                    style={{

                        width: "100%",

                        padding: "14px",

                        borderRadius: "12px",

                        border: "none",

                        background: "#E67E22",

                        color: "white",

                        fontSize: "17px",

                        fontWeight: 700,

                        cursor: "pointer",

                    }}

                >

                    Register

                </button>



                <p

                    style={{

                        textAlign: "center",

                        marginTop: "20px",

                        color: "#636E72",

                    }}

                >

                    Already have an account?


                    <span

                        onClick={
                            () => navigate("/login")
                        }

                        style={{

                            color: "#E67E22",

                            fontWeight: 700,

                            cursor: "pointer",

                            marginLeft: "5px",

                        }}

                    >

                        Login

                    </span>


                </p>



            </form>


        </div>

    );

}


export default Register;