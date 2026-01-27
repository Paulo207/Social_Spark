import type { Post, SocialAccount } from '../types';
import * as storage from '../utils/storage';
import type { AppSettings } from '../utils/storage';

// --- POSTS ---
export const getPosts = async (): Promise<Post[]> => {
    return await storage.getPosts();
};

export const savePost = async (post: Post): Promise<Post> => {
    return await storage.savePost(post);
};

export const updatePostStatus = async (postId: string, status: Post['status']): Promise<Post> => {
    await storage.updatePostStatus(postId, status);
    const posts = await storage.getPosts();
    return posts.find(p => p.id === postId)!;
};

// --- PUBLISHING (DELEGATED TO BACKEND) ---
export const publishPostNow = async (postId: string): Promise<Post> => {
    // Note: imageFiles ignored here because backend uses stored URLs/Base64.
    // If the image was JUST added (File object in memory), it needs to be uploaded/converted AND saved to DB first.
    // PostComposer handles saving before calling this. 
    // BUT we need to make sure the image field in `post` has the dataUrl or uploaded URL before backend sees it.
    // Assuming UI flow is: Save -> Publish.

    // We call the backend endpoint
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/posts/${postId}/publish`, {
        method: 'POST'
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao publicar postagem (Backend)');
    }

    const updatedPost = await response.json();
    return {
        ...updatedPost,
        images: JSON.parse(updatedPost.images || '[]')
    };
};

// --- ACCOUNTS ---
export const getAccounts = async (): Promise<SocialAccount[]> => {
    return await storage.getAccounts();
};

export const saveAccount = async (account: SocialAccount): Promise<SocialAccount> => {
    await storage.saveAccount(account);
    return account;
};

export const deleteAccount = async (accountId: string): Promise<void> => {
    await storage.deleteAccount(accountId);
};

// --- SETTINGS ---
export const getSettings = async (): Promise<AppSettings> => {
    return await storage.getSettings();
};

export const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
    await storage.saveSettings(settings);
    return settings;
};

export const initializeStorage = async (): Promise<void> => {
    await storage.initializeStorage();
};

// --- IMAGE/VIDEO HOSTING (Client-side helper) ---
// Kept for PostComposer to generate URLs if needed before saving, 
// though generally we might just save base64 and let backend handle it, 
// but backend `publishToInstagram` logic expects `uploadToCloudinary` equivalent if base64.
// The backend `social.ts` DOES have logic to handle base64, but specifically for Instagram it throws:
// "Instagram cannot publish Base64 local images".
// So we STILL need to upload to Cloudinary EITHER here or in Backend.
// Backend `social.ts` does NOT import `uploadToCloudinary`.
// It assumes `post.images` has a URL.
// So: Client MUST upload to Cloudinary --> Update Post with URL --> Save --> Publish.

export const uploadToCloudinary = async (file: File): Promise<string> => {
    const settings = await storage.getSettings();
    const cloudName = settings.cloudinaryCloudName;
    const uploadPreset = settings.cloudinaryUploadPreset;

    if (!cloudName || !uploadPreset) {
        throw new Error('Configuração do Cloudinary ausente. Configure o Cloud Name e o Upload Preset nas configurações.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao hospedar mídia no Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
};
