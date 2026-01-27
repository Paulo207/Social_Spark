import { useState, useEffect } from 'react';

// Define the User type strictly
export interface User {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    accessToken?: string; // JWT from backend
    picture?: string; // Optional, might be added later
}



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser({ ...data.user, accessToken: token });
            } else {
                logout();
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (identifier: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha no login');
            }

            localStorage.setItem('token', data.token);
            setUser({ ...data.user, accessToken: data.token });
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, password: string, email?: string, phone?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password, email, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha no cadastro');
            }

            localStorage.setItem('token', data.token);
            setUser({ ...data.user, accessToken: data.token });
            return true;
        } catch (err: any) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const loginGuest = () => {
        // kept for backward compatibility if needed, but primarily we want real auth now
        const guestUser: User = {
            id: 'guest',
            name: 'Convidado',
            accessToken: 'guest-token'
        };
        setUser(guestUser);
        localStorage.setItem('token', 'guest-token');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        loginGuest,
        logout
    };
};
