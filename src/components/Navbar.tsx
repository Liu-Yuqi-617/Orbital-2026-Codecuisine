import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                marginBottom: "20px",
                padding: "10px",
                borderBottom: "1px solid #ccc",
            }}
        >
            <button
                onClick={() => navigate("/profile")}
            >
                Profile
            </button>

            {" "}

            <button
                onClick={() => navigate("/reviews")}
            >
                Reviews
            </button>
        </div>
    );
}