import FormData from 'form-data';
import fetch from 'node-fetch';

interface GraphError {
    error: {
        message: string;
        type: string;
        code: number;
    };
}

export const socialService = {
    async publishPost(post: any, account: any) {
        console.log(`[SocialService] Publishing post ${post.id} to ${account.platform}`);

        try {
            if (account.platform === 'facebook') {
                return await this.publishToFacebook(post, account);
            } else if (account.platform === 'instagram') {
                return await this.publishToInstagram(post, account);
            }
        } catch (error: any) {
            console.error(`[SocialService] Failed to publish post ${post.id}:`, error.message);
            throw error;
        }
    },

    async publishToFacebook(post: any, account: any) {
        const pageId = account.originalResponse.id;
        const accessToken = account.accessToken;
        const message = post.caption;

        const images = JSON.parse(post.images);

        if (images && images.length > 0) {
            const mediaUrl = images[0];
            const isVideo = mediaUrl.match(/\.(mp4|mov|avi|wmv)$/i) || mediaUrl.startsWith('data:video');

            const endpoint = isVideo ? 'videos' : 'photos';

            if (mediaUrl.startsWith('data:')) {
                // Base64 Upload
                const formData = new FormData();
                formData.append('access_token', accessToken);

                if (isVideo) {
                    formData.append('description', message);
                } else {
                    formData.append('message', message);
                }

                const base64Data = mediaUrl.split(',')[1];
                const cleanBase64 = base64Data.replace(/\s/g, '');
                const buffer = Buffer.from(cleanBase64, 'base64');

                const mimeType = mediaUrl.split(';')[0].split(':')[1];

                formData.append('source', buffer, {
                    filename: isVideo ? 'video.mp4' : 'image.jpg',
                    contentType: mimeType
                });

                const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/${endpoint}`, {
                    method: 'POST',
                    headers: formData.getHeaders(),
                    body: formData as any
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error?.message || `Failed to upload ${isVideo ? 'video' : 'photo'} to Facebook`);
                }

                return await response.json();
            } else {
                // URL Upload
                const formData = new FormData();
                formData.append('access_token', accessToken);

                if (isVideo) {
                    formData.append('description', message);
                    formData.append('file_url', mediaUrl);
                } else {
                    formData.append('message', message);
                    formData.append('url', mediaUrl);
                }

                const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/${endpoint}`, {
                    method: 'POST',
                    headers: formData.getHeaders(),
                    body: formData as any
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error?.message || `Failed to publish ${isVideo ? 'video' : 'photo'} url to Facebook`);
                }
                return await response.json();
            }

        } else {
            // Text only
            const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    access_token: accessToken
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Failed to publish text to Facebook');
            }
            return await response.json();
        }
    },

    async publishToInstagram(post: any, account: any) {
        const images = JSON.parse(post.images);
        if (!images || images.length === 0) {
            throw new Error('Instagram requires an image or video.');
        }

        const mediaUrl = images[0];
        if (mediaUrl.startsWith('data:')) {
            throw new Error('Instagram cannot publish Base64 local images. Image must be hosted on a public server.');
        }

        const isVideo = mediaUrl.match(/\.(mp4|mov|avi|wmv)$/i);
        const igUserId = account.originalResponse.instagram_business_account?.id || account.originalResponse.id;
        const accessToken = account.accessToken;

        // 1. Create Container
        const params = new URLSearchParams({
            access_token: accessToken,
            caption: post.caption,
        });

        if (isVideo) {
            params.append('media_type', 'REELS');
            params.append('video_url', mediaUrl);
        } else {
            params.append('image_url', mediaUrl);
        }

        const containerResponse = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}/media?${params.toString()}`,
            { method: 'POST' }
        );

        const containerData = await containerResponse.json();
        if (!containerResponse.ok) {
            throw new Error(containerData.error?.message || 'Erro ao criar container no Instagram');
        }

        const creationId = containerData.id;
        if (!creationId) throw new Error('Falha ao obter ID de criação do Instagram');

        // 2. Poll for status (Ported from frontend graphApi.ts)
        let isReady = false;
        let attempts = 0;
        const maxAttempts = isVideo ? 45 : 15; // Increased timeout for videos

        while (!isReady && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

            const statusResponse = await fetch(
                `https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${accessToken}`
            );

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                if (statusData.status_code === 'FINISHED') {
                    isReady = true;
                } else if (statusData.status_code === 'ERROR') {
                    throw new Error('O Instagram não conseguiu processar esta mídia. Verifique o formato.');
                }
            }
        }

        if (!isReady) {
            throw new Error('Tempo limite de processamento do Instagram esgotado.');
        }

        // 3. Publish Container
        const publishResponse = await fetch(
            `https://graph.facebook.com/v19.0/${igUserId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`,
            { method: 'POST' }
        );

        const publishData = await publishResponse.json();
        if (!publishResponse.ok) {
            throw new Error(publishData.error?.message || 'Erro ao finalizar publicação no Instagram');
        }

        return publishData;
    }
};
