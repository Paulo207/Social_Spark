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



const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_URL = VITE_API_URL ? `${VITE_API_URL}/api` : 'http://localhost:3000/api';

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

        // Validate token format
        if (token === 'guest-token' || token.split('.').length !== 3) {
            console.log('Invalid or legacy token found, clearing session.');
            logout();
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

    const login = async (identifier: string, password: string): Promise<User | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const cleanIdentifier = identifier.trim();
            const cleanPassword = password.trim();

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: cleanIdentifier, password: cleanPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha no login');
            }

            localStorage.setItem('token', data.token);
            const userData = { ...data.user, accessToken: data.token };
            setUser(userData);
            return userData;
        } catch (err: any) {
            setError(err.message);
            return null;
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
        // Guest mode removed for SaaS production
        console.warn("Guest login disabled for production");
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
