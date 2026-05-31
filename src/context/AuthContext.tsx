import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react"

import type { User } from "../types/user"

interface AuthContextType {
    user: User | null

    login: (
        user: User
    ) => void

    logout: () => void
}

const AuthContext =
    createContext<AuthContextType | null>(
        null
    )

export function AuthProvider({
    children
}: {
    children: React.ReactNode
}) {

    const [user, setUser] =
        useState<User | null>(null)

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user")

        if (savedUser) {

            setUser(
                JSON.parse(savedUser)
            )
        }

    }, [])

    function login(userData: User) {

        setUser(userData)

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        )
    }

    function logout() {

        setUser(null)

        localStorage.removeItem(
            "user"
        )
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {

    const context =
        useContext(AuthContext)

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        )
    }

    return context
}