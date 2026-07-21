import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as login_api } from "../api";


function Login() {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");


    const { login } = useAuth();

    const navigate = useNavigate();




    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        setError("");


        try {

            const res = await login_api({
                email,
                password,
            });



            if (res.data.code === 200) {


                const {
                    token,
                    username,
                    email:userEmail
                } = res.data.data;



                login(
                    {
                        username,
                        email:userEmail,
                    },
                    token
                );


                navigate("/profile");


            } else {

                setError(
                    res.data.message
                );

            }


        } catch(err:any){

            setError(
                err.response?.data?.message ||
                "Failed to login"
            );

        }

    }




    return (

        <div

        style={{

            minHeight:"100vh",

            background:"#F7F8FA",

            display:"flex",

            justifyContent:"center",

            alignItems:"center",

            padding:"40px 20px",

        }}

        >



        <form

        onSubmit={handleSubmit}


        style={{

            width:"100%",

            maxWidth:"420px",

            background:"#FFFFFF",

            padding:"40px",

            borderRadius:"22px",

            boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",

        }}

        >



            <div

            style={{

                textAlign:"center",

                marginBottom:"30px",

            }}

            >

                <h1

                style={{

                    color:"#E67E22",

                    fontSize:"32px",

                    fontWeight:800,

                }}

                >

                    🍽 FoodTrust

                </h1>



                <h2

                style={{

                    color:"#2D3436",

                }}

                >

                    Welcome Back

                </h2>



                <p

                style={{

                    color:"#636E72",

                }}

                >

                    Login to continue

                </p>


            </div>





            {
                error &&

                <div

                style={{

                    background:"#FDECEC",

                    color:"#C0392B",

                    padding:"12px",

                    borderRadius:"10px",

                    marginBottom:"20px",

                    fontSize:"14px",

                }}

                >

                    {error}

                </div>

            }





            <label
            style={{
                color:"#2D3436",
                fontWeight:600,
            }}
            >
                Email
            </label>


            <input

            type="email"

            value={email}

            onChange={
                e=>setEmail(
                    e.target.value
                )
            }

            placeholder="Enter your email"

            required


            style={{

                width:"100%",

                marginTop:"8px",

                marginBottom:"20px",

                padding:"13px",

                borderRadius:"12px",

                border:
                "1px solid #E8E1D9",

                fontSize:"15px",

                boxSizing:
                "border-box",

            }}

            />






            <label
            style={{
                color:"#2D3436",
                fontWeight:600,
            }}
            >
                Password
            </label>


            <input

            type="password"

            value={password}

            onChange={
                e=>setPassword(
                    e.target.value
                )
            }


            placeholder="Enter your password"

            required


            style={{

                width:"100%",

                marginTop:"8px",

                marginBottom:"25px",

                padding:"13px",

                borderRadius:"12px",

                border:
                "1px solid #E8E1D9",

                fontSize:"15px",

                boxSizing:
                "border-box",

            }}

            />







            <button

            type="submit"


            style={{

                width:"100%",

                padding:"14px",

                borderRadius:"12px",

                border:"none",

                background:"#E67E22",

                color:"white",

                fontSize:"17px",

                fontWeight:700,

                cursor:"pointer",

            }}

            >

                Login

            </button>





            <p

            style={{

                textAlign:"center",

                marginTop:"25px",

                color:"#636E72",

            }}

            >

                Don't have an account?


                <span

                onClick={
                    ()=>navigate("/register")
                }


                style={{

                    color:"#E67E22",

                    marginLeft:"6px",

                    fontWeight:700,

                    cursor:"pointer",

                }}

                >

                    Register

                </span>


            </p>



        </form>


        </div>

    );

}


export default Login;