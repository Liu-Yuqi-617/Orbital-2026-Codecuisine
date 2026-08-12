import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Reviews from "./pages/Reviews"
import Search from "./pages/Search"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Wishlist from "./pages/Wishlist"
import RestaurantDetail from "./pages/RestaurantDetail"

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

                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <Search />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/wishlist"
                        element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/restaurant/:id"
                        element={
                            <ProtectedRoute>
                                <RestaurantDetail />
                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </BrowserRouter>

        </AuthProvider>

    )
}

export default App