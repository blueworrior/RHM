import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({children}){
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    const login = (data) => {
    // Flatten so role is at top level for ProtectedRoute
    const userData = {
        ...data.user, // id, first_name, last_name, role, is_super_admin
        token: data.token
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
};
    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}