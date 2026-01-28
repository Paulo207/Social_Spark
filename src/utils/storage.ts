// src/utils/storage.ts
import type { Post, SocialAccount } from '../types';

// API Configuration
// API Configuration
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export interface AppSettings {
    appId: string;
    appSecret: string;
    token?: string;
    cloudinaryCloudName?: string;
    cloudinaryUploadPreset?: string;
}

// --- HELPER FETCH WRAPPER ---
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers,
        ...options
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error ${response.status}: ${error}`);
    }

    // Handle empty responses (like DELETE)
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// --- POSTS ---
export const getPosts = async (): Promise<Post[]> => {
    try {
        const posts = await apiRequest<Post[]>('/posts');
        if (!posts) return [];

        return posts.map((post: any) => ({
            ...post,
            scheduledDate: new Date(post.scheduledDate),
            createdAt: new Date(post.createdAt),
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
            // Ensure images is array (backend parses it already)
            images: Array.isArray(post.images) ? post.images : []
        }));
    } catch (e) {
        console.error('Failed to fetch posts:', e);
        return [];
    }
};

export const savePost = async (post: Post): Promise<Post> => {
    // Determine if it's a new post (temp ID) or update
    // If ID starts with 'temp-', it's definitely new. However, backend assigns UUIDs.
    // If we send a temp ID to backend, backend ignores it on CREATE.
    // Ideally we should check if it exists or just treat temp IDs as CREATE.

    // Logic: If it has a UUID-like format, try UPDATE. If temp, CREATE.
    const isTempId = post.id.startsWith('temp-');

    if (isTempId) {
        // Create
        // Remove ID so backend generates one, remove createdAt so backend sets it
        const { id, createdAt, ...data } = post;
        return await apiRequest<Post>('/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    } else {
        // Update
        return await apiRequest<Post>(`/posts/${post.id}`, {
            method: 'PUT',
            body: JSON.stringify(post)
        });
    }
};

export const deletePost = async (postId: string): Promise<void> => {
    await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
};

export const updatePostStatus = async (postId: string, status: Post['status']): Promise<void> => {
    await apiRequest(`/posts/${postId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
            status,
            publishedAt: status === 'published' ? new Date() : null
        })
    });
};

// --- ACCOUNTS ---
export const getAccounts = async (): Promise<SocialAccount[]> => {
    try {
        const accounts = await apiRequest<SocialAccount[]>('/accounts');
        if (!accounts) return [];

        return accounts.map((account: any) => ({
            ...account,
            lastSync: account.lastSync ? new Date(account.lastSync) : undefined,
            // Ensure originalResponse is object (backend parses it)
            originalResponse: typeof account.originalResponse === 'object' ? account.originalResponse : {}
        }));
    } catch (e) {
        console.error('Failed to fetch accounts:', e);
        // Fallback to Env vars if API fails/empty? No, user explicitly wanted backend logic.
        // But for "Initialize" logic we can keep some fallback if needed, but let's stick to API.
        return [];
    }
};

export const saveAccount = async (account: SocialAccount): Promise<void> => {
    // Accounts usually don't have temp IDs being passed around same way, 
    // but handleAddAccount in App.tsx generates temp IDs.
    const isTempId = account.id.startsWith('temp-');

    if (isTempId) {
        const { id, ...data } = account;
        await apiRequest('/accounts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    } else {
        // Since we don't have a specific PUT /accounts/:id in backend (yet), 
        // effectively we might treat saves as creates or simply warn. 
        // But current App logic mostly adds. Updating accounts is rare (except delete).
        // Let's assume CREATE for simplicity or add PUT if strictly needed.
        // For now, if it's existing, we don't really edit accounts in UI other than delete.
        console.warn('Updating existing account not fully implemented, trying create might duplicate if ID ignored');
    }
};

export const deleteAccount = async (accountId: string): Promise<void> => {
    await apiRequest(`/accounts/${accountId}`, { method: 'DELETE' });
};

// --- SETTINGS ---
export const getSettings = async (): Promise<AppSettings> => {
    try {
        return await apiRequest<AppSettings>('/settings');
    } catch (e) {
        console.error('Failed to fetch settings:', e);
        return { appId: '', appSecret: '' };
    }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
    await apiRequest('/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
    });
};

// Initialize
export const initializeStorage = async (): Promise<void> => {
    // With backend, initialization is mostly ensuring the backend is reachable
    // or seeding it if empty (optional).
    // The previous logic checked env vars and seeded. 
    // We can do a quick check and seed if backend is empty.

    // Check if we have accounts
    const accounts = await getAccounts();
    if (accounts.length === 0) {
        // Read from .env
        const envToken = import.meta.env.VITE_FB_TOKEN || '';
        const envIgId = import.meta.env.VITE_IG_ID || '';
        const envPageId = import.meta.env.VITE_PAGE_ID || '';
        const envAppId = import.meta.env.VITE_APP_ID || '';
        const envAppSecret = import.meta.env.VITE_APP_SECRET || '';

        // If env vars exist, populate backend
        if (envToken && envIgId && envPageId) {
            const mockAccount1 = {
                platform: 'instagram',
                username: 'virttus_collection_store',
                profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=virttus',
                isConnected: true,
                followers: 1234,
                accessToken: envToken,
                igUserId: envIgId,
                pageId: envPageId,
                lastSync: new Date(),
                originalResponse: { id: envIgId } // Mock response
            };

            const mockAccount2 = {
                platform: 'facebook',
                username: 'Virtus Store',
                profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=virtus_fb',
                isConnected: true,
                followers: 5678,
                accessToken: envToken,
                pageId: envPageId,
                igUserId: envIgId,
                lastSync: new Date(),
                originalResponse: { id: envPageId }
            };

            // Call API directly
            await apiRequest('/accounts', { method: 'POST', body: JSON.stringify(mockAccount1) });
            await apiRequest('/accounts', { method: 'POST', body: JSON.stringify(mockAccount2) });
        }

        if (envAppId && envAppSecret) {
            await apiRequest('/settings', {
                method: 'POST',
                body: JSON.stringify({
                    appId: envAppId,
                    appSecret: envAppSecret,
                    cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                    cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
                })
            });
        }
    }
};
