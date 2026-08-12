import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import Reviews from "./pages/Reviews"
import Search from "./pages/Search"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Wishlist from "./pages/Wishlist"
<<<<<<< HEAD

=======
import RestaurantDetail from "./pages/RestaurantDetail"
>>>>>>> 1bb433bde7d29181141a25b99ecaf7e82740cd55

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

<<<<<<< HEAD
=======
                    <Route
                        path="/restaurant/:id"
                        element={
                            <ProtectedRoute>
                                <RestaurantDetail />
                            </ProtectedRoute>
                        }
                    />

>>>>>>> 1bb433bde7d29181141a25b99ecaf7e82740cd55
                </Routes>

            </BrowserRouter>

        </AuthProvider>

    )
}

export default App