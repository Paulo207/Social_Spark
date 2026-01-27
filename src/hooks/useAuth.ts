import { useState, useEffect } from 'react';
import { getSettings } from '../services/api';

interface User {
    name: string;
    picture: string;
    accessToken: string;
    id: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSdkLoaded, setIsSdkLoaded] = useState(false);

    useEffect(() => {
        // Load saved session
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);

        // Load FB SDK
        const loadSdk = async () => {
            const settings = await getSettings();
            if (!settings.appId) return;

            // @ts-ignore
            window.fbAsyncInit = function () {
                // @ts-ignore
                window.FB.init({
                    appId: settings.appId,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0'
                });
                setIsSdkLoaded(true);
            };

            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) { return; }
                js = d.createElement(s); js.id = id;
                // @ts-ignore
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                // @ts-ignore
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        };

        loadSdk();
    }, []);

    const login = () => {
        // Bypass for localhost to avoid HTTPS requirement
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log("Localhost detected: using Guest Login bypass.");
            loginGuest();
            return;
        }

        if (!isSdkLoaded) {
            alert("SDK do Facebook ainda não carregou ou App ID não configurado.");
            return;
        }

        // @ts-ignore
        window.FB.login((response) => {
            if (response.authResponse) {
                const accessToken = response.authResponse.accessToken;

                // Fetch User Profile
                // @ts-ignore
                window.FB.api('/me', { fields: 'name, picture' }, (profileResponse) => {
                    const newUser: User = {
                        name: profileResponse.name,
                        picture: profileResponse.picture?.data?.url || '',
                        accessToken: accessToken,
                        id: profileResponse.id
                    };

                    setUser(newUser);
                    localStorage.setItem('auth_user', JSON.stringify(newUser));
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'public_profile,pages_show_list,instagram_basic,pages_read_engagement' });
    };

    const loginGuest = () => {
        const guestUser: User = {
            name: "Admin Local",
            picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
            accessToken: "guest-token",
            id: "guest-id"
        };
        setUser(guestUser);
        localStorage.setItem('auth_user', JSON.stringify(guestUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginGuest,
        logout
    };
};
