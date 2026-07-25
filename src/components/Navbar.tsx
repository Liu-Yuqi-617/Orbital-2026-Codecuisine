import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        {
            name: "Home",
            path: "/"
        },
        {
            name: "Reviews",
            path: "/reviews"
        },
        {
            name: "Search",
            path: "/search"
        },
        {
            name: "Wishlist",
            path: "/wishlist"
        },
        {
            name: "Profile",
            path: "/profile"
        }
    ];

    return (
        <nav
            style={{
                background: "#FFFFFF",
                padding: "16px 40px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                position: "sticky",
                top: 0,
                zIndex: 100,
            }}
        >
            {/* Logo */}
            <Link
                to="/"
                style={{
                    textDecoration: "none",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#E67E22",
                }}
            >
                🍽 FoodTrust
            </Link>

            {/* Navigation */}
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                }}
            >
                {navItems.map((item) => {
                    const active = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                textDecoration: "none",
                                padding: "10px 18px",
                                borderRadius: "20px",
                                color: active ? "#FFFFFF" : "#2D3436",
                                background: active ? "#E67E22" : "transparent",
                                fontWeight: 600,
                                transition: "0.2s",
                            }}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* User */}
            <div>
                {user ? (
                    <button
                        onClick={logout}
                        style={{
                            border: "none",
                            background: "#FFF0E5",
                            color: "#E67E22",
                            padding: "10px 16px",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Logout
                    </button>
                ) : (
                    <Link
                        to="/login"
                        style={{
                            textDecoration: "none",
                            color: "#E67E22",
                            fontWeight: 600,
                        }}
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}