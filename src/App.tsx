import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Reviews from "./pages/Reviews"

import {
    AuthProvider
} from "./context/AuthContext"

import ProtectedRoute
    from "./components/ProtectedRoute"

function App() {

    return (

        <AuthProvider>

            <BrowserRouter>

                <Routes>

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reviews"
                        element={
                            <ProtectedRoute>
                                <Reviews />
                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </BrowserRouter>

        </AuthProvider>

    )
}

export default App