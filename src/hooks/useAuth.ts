import { useState, useEffect } from 'react';

// Define the User type strictly
export interface User {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    accessToken?: string; // JWT from backend
    picture?: string; // Optional, might be added later
    role?: string; // 'user' | 'developer'
}



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuth = () => {
    // Initialize with a default user to bypass login
    const [user, setUser] = useState<User | null>({
        id: 'default-user',
        name: 'Usuário Padrão',
        email: 'usuario@exemplo.com',
        role: 'developer', // Give full access
        accessToken: 'bypass-token'
    });
    const [isLoading, setIsLoading] = useState(false); // No loading, instant access
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // We can still try to check auth or just skip it.
        // For "removing login", we might just want to stay as this default user.
        // Let's comment out checkAuth to prevent it from overriding our default user with null.
        // checkAuth(); 
    }, []);

    const checkAuth = async () => {
        // Disabled for open access
    };

    const login = async (identifier: string, password: string): Promise<User | null> => {
        // Mock success
        return user;
    };

    const register = async (name: string, password: string, email?: string, phone?: string) => {
        return true;
    };

    const loginGuest = () => { };

    const logout = () => {
        // Do nothing, or reset to default user
        // setUser(null); // Don't allow logout to lock the screen
    };

    return {
        user,
        isAuthenticated: true, // Always true
        isLoading,
        error,
        login,
        register,
        loginGuest,
        logout
    };
};
