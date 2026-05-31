import { createContext, useContext, useState } from "react";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    function login(userData: any, jwtToken?: string) {
        setUser(userData);

        if (jwtToken) {
            setToken(jwtToken);
            localStorage.setItem("token", jwtToken);
        }
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}