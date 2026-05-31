import {
    useAuth
} from "../context/AuthContext";

import Navbar from "../components/Navbar";

export default function Profile() {


    const {
        user,
        logout
    } = useAuth();

    console.log(user);

    return (

        <div>

            <Navbar />

            <h1>
                Profile
            </h1>

            <p>
                Username:
                {" "}
                {user?.username}
            </p>

            <p>
                Email:
                {" "}
                {user?.email}
            </p>

            <button
                onClick={() => {

                    logout();

                    window.location.href =
                        "/login";
                }}
            >
                Logout
            </button>

        </div>
    );
}